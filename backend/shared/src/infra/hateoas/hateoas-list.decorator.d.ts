import type { LinksMap } from './hateoas.types';
export declare const HATEOAS_LIST_KEY = "hateoas:list";
export interface HateoasListOptions<T = Record<string, unknown>> {
    basePath: string;
    itemLinks: (item: T) => LinksMap;
}
export declare const HateoasList: <T>(options: HateoasListOptions<T>) => import("@nestjs/common").CustomDecorator<string>;
