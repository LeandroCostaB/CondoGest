"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HateoasList = exports.HATEOAS_LIST_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.HATEOAS_LIST_KEY = 'hateoas:list';
const HateoasList = (options) => (0, common_1.SetMetadata)(exports.HATEOAS_LIST_KEY, options);
exports.HateoasList = HateoasList;
//# sourceMappingURL=hateoas-list.decorator.js.map