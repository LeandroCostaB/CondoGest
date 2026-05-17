"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HateoasInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const hateoas_item_decorator_1 = require("./hateoas-item.decorator");
const hateoas_list_decorator_1 = require("./hateoas-list.decorator");
let HateoasInterceptor = class HateoasInterceptor {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        const listOptions = this.reflector.get(hateoas_list_decorator_1.HATEOAS_LIST_KEY, context.getHandler());
        const itemOptions = this.reflector.get(hateoas_item_decorator_1.HATEOAS_ITEM_KEY, context.getHandler());
        if (!listOptions && !itemOptions) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (listOptions) {
                return this.transformList(data, listOptions, request.query);
            }
            return this.transformItem(data, itemOptions);
        }));
    }
    transformList(paginated, options, _query) {
        const { data, total, page, limit } = paginated;
        const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
        const { basePath } = options;
        const itemsWithLinks = data.map((item) => ({
            ...item,
            _links: options.itemLinks(item),
        }));
        return {
            data: itemsWithLinks,
            meta: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages,
            },
            _links: {
                self: { href: `${basePath}?page=${page}&limit=${limit}`, method: 'GET' },
                next: page < totalPages ? { href: `${basePath}?page=${page + 1}&limit=${limit}`, method: 'GET' } : null,
                prev: page > 1 ? { href: `${basePath}?page=${page - 1}&limit=${limit}`, method: 'GET' } : null,
                first: { href: `${basePath}?page=1&limit=${limit}`, method: 'GET' },
                last: { href: `${basePath}?page=${totalPages}&limit=${limit}`, method: 'GET' },
                create: { href: basePath, method: 'POST' },
            },
        };
    }
    transformItem(item, options) {
        if (!item)
            return null;
        return {
            ...item,
            _links: options.itemLinks(item),
        };
    }
};
exports.HateoasInterceptor = HateoasInterceptor;
exports.HateoasInterceptor = HateoasInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], HateoasInterceptor);
//# sourceMappingURL=hateoas.interceptor.js.map