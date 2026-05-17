import type { LinksMap } from './hateoas.types';
export declare const HATEOAS_ITEM_KEY = "hateoas:item";
export interface HateoasItemOptions<T = Record<string, unknown>> {
    basePath: string;
    itemLinks: (item: T) => LinksMap;
}
export declare const HateoasItem: <T>(options: HateoasItemOptions<T>) => import("@nestjs/common").CustomDecorator<string>;
