import { Controller, Get, Param } from '@nestjs/common';
import { GithubService } from './github/services/github.service';
import { CmcService } from './cmc/services/cmc.service';
import { ParserService } from './parser/services/parser.service';
@Controller()
export class AppController {
  public constructor(
    private githubService: GithubService,
    private cmcService: CmcService,
    private parser: ParserService
  ) {}

  @Get()
  public root() {
    return 'Hello CML';
  }

  @Get('org/:id/:login/:slug')
  public getOrganization(@Param() params) {
    return this.githubService.requestOrganization(params.id, params.login, params.slug);
  }

  @Get('cmc/listings')
  public getCmcListings() {
    return this.cmcService.requestListings().then((response) => {
      return response;
    });
  }

  @Get('cmc/global')
  public getCmcGlobalData() {
    return this.cmcService.requestGlobalData().then((response) => {
      return response;
    });
  }

  @Get('cmc/tickers')
  public getCmcTickers() {
    return this.cmcService.updateTickers().then((response) => {
      return response;
    });
  }

  @Get('org/website-update/:login')
  public updateOrgWebsite(@Param() params) {
    return this.parser.updateOrganizationWebsite(params.login);
  }
}
