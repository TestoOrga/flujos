sap.ui.define(
  [
    "bafar/flujos/flujos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
  ],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("bafar.flujos.flujos.controller.MainView", {
      onInit: function () {
        var oFlujo = new JSONModel({ seccion1: "Seccion1", seccion2: "Seccion2", seccion3: "Seccion3" });
        this.getView().setModel(oFlujo, "flujo");
      },
      onGrabar: function () {
        this.getView().byId("headerFlujosPageSec3").setVisible(true);
      },
      onCancelar: function () {
        this.getView().byId("headerFlujosPageSec3").setVisible(false);
      }
    });
  }
);
