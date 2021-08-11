sap.ui.define(
  [
    "bafar/flujos/flujos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
  ],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("bafar.flujos.flujos.controller.MainView", {
      onInit: function () {
        var oFlujo = new JSONModel({
          seccion1: this.getResourceBundle().getText(
            "Pensiones.DatosPersonales.panel"
          ),
          seccion2: this.getResourceBundle().getText(
            "Pensiones.JuridicoDeudas.panel"
          ),
          seccion3: "Seccion3",
        });
        this.getView().setModel(oFlujo, "flujo");
      },
      onGrabar: function () {
        this.getView().byId("headerFlujosPageSec3").setVisible(true);
      },
      onCancelar: function () {
        this.getView().byId("headerFlujosPageSec3").setVisible(false);
      },
    });
  }
);
