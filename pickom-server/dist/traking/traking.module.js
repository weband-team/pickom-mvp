"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrakingModule = void 0;
const common_1 = require("@nestjs/common");
const user_module_1 = require("../user/user.module");
const traking_service_1 = require("./traking.service");
const traking_controller_1 = require("./traking.controller");
const offer_module_1 = require("../offer/offer.module");
let TrakingModule = class TrakingModule {
};
exports.TrakingModule = TrakingModule;
exports.TrakingModule = TrakingModule = __decorate([
    (0, common_1.Module)({
        imports: [user_module_1.UserModule, offer_module_1.OfferModule],
        controllers: [traking_controller_1.TrakingController],
        providers: [traking_service_1.TrakingService],
        exports: [traking_service_1.TrakingService],
    })
], TrakingModule);
//# sourceMappingURL=traking.module.js.map