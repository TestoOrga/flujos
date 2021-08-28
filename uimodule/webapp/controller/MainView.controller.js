sap.ui.define(["bafar/flujos/flujos/controller/BaseController",
	"sap/m/MessageToast"], function (BaseController,
	MessageToast) {
    "use strict";

    return BaseController.extend("bafar.flujos.flujos.controller.MainView", {
        onInit: function () {

        },
        onPress: function(){
            this.navTo("HeaderFlujosView");
            MessageToast.show("customControl");
        }
    });
});
