"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HateoasItem = exports.HATEOAS_ITEM_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.HATEOAS_ITEM_KEY = 'hateoas:item';
const HateoasItem = (options) => (0, common_1.SetMetadata)(exports.HATEOAS_ITEM_KEY, options);
exports.HateoasItem = HateoasItem;
//# sourceMappingURL=hateoas-item.decorator.js.map