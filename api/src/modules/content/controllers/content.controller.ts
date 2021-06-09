import { Controller, Get, Body, Post, Put, Delete, Param, Headers, Query, UseGuards, UnauthorizedException, Request, ForbiddenException } from '@nestjs/common';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';

import { Paginated } from '~shared/types';
import { AuthGuard } from '~shared/guards/auth.guard';
import { Permissions, AuditLog } from '~shared/decorators';

import { ContentService } from '../services/content.service';
import { PermissionService } from '~shared/services/permission.service';


@Controller('/content-types/:contentTypeUuid/content')
@ApiTags('Content')
@ApiBasicAuth()
@UseGuards(AuthGuard)
export class ContentController {

	constructor(
		private contentService: ContentService,
		private permissionService: PermissionService,
	) { }

	@Get()
	public async findContentTypeEntries(
		@Query('page') page = 1,
		@Query('pagesize') pagesize = 20,
		@Query('search') search: string,
		@Param('contentTypeUuid') contentTypeUuid: string,
		@Request() req,
	): Promise<Paginated<any>> {
		if (!await this.permissionService.hasPermission(req.user?.uuid || req.headers.authorization, [`content/${contentTypeUuid}/read`])) {
			throw new ForbiddenException(`Missing permissions: content/${contentTypeUuid}/read`)
		}

		return this.contentService.findByContentType(contentTypeUuid, page, pagesize, search);
	}

	@Get('/:entryUuid')
	public async one(
		@Param('contentTypeUuid') contentTypeUuid: string,
		@Param('entryUuid') entryUuid: string,
		@Request() req,
	): Promise<any | undefined> {
		if (!await this.permissionService.hasPermission(req.user?.uuid || req.headers.authorization, [`content/${contentTypeUuid}/read`])) {
			throw new ForbiddenException(`Missing permissions: content/${contentTypeUuid}/read`)
		}

		return this.contentService.findOne(contentTypeUuid, entryUuid);
	}

	@Post()
	public async create(
		@Param('contentTypeUuid') contentTypeUuid: string,
		@Body() content: any,
		@Request() req,
	): Promise<any> {
		if (!await this.permissionService.hasPermission(req.user?.uuid || req.headers.authorization, [`content/${contentTypeUuid}/create`])) {
			throw new ForbiddenException(`Missing permissions: content/${contentTypeUuid}/read`)
		}

		return this.contentService.create(contentTypeUuid, content);
	}

	@Put('/:entryUuid')
	@AuditLog('content/update')
	public async update(
		@Param('contentTypeUuid') contentTypeUuid: string,
		@Param('entryUuid') uuid: string,
		@Body() content: any,
		@Request() req,
	): Promise<any> {
		if (!await this.permissionService.hasPermission(req.user?.uuid || req.headers.authorization, [`content/${contentTypeUuid}/update`])) {
			throw new ForbiddenException(`Missing permissions: content/${contentTypeUuid}/read`)
		}

		return this.contentService.update(contentTypeUuid, uuid, content);
	}

	@Delete('/:entryUuid')
	@AuditLog('content/delete')
	public async delete(
		@Param('contentTypeUuid') contentTypeUuid: string,
		@Param('entryUuid') uuid: string,
		@Request() req,
	): Promise<void> {
		if (!await this.permissionService.hasPermission(req.user?.uuid || req.headers.authorization, [`content/${contentTypeUuid}/delete`])) {
			throw new ForbiddenException(`Missing permissions: content/${contentTypeUuid}/read`)
		}

		return await this.contentService.delete(contentTypeUuid, uuid);
	}

}
