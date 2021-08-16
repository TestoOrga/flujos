sap.ui.define(
  [
    "bafar/flujos/flujos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/XMLView"
  ],
  function (Controller, JSONModel, XMLView) {
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
        var mainModel = this.getModel();
        var oEntityData = {
          P1: "CAT",
          P2: "BUKRS",
          to_pesal: []
        };
        mainModel.create("/BaseSet", oEntityData, {
          async: true,
          success: function (req, res) {
            console.log({ res });
          },
          error: function (error) {
            console.log({ error });
          }
        })
      },
      onCancelar: function () {
        this.getView().byId("headerFlujosPageSec3").setVisible(false);
      },
      addPanel: function (oEvent, param) {
        switch (param) {
          case "1":
            var oRef = this.getView().byId("headerFlujosInsertPanel2");
            var oController = sap.ui.core.mvc.Controller.create({name: "bafar.flujos.flujos.controller.PensionesC.JuridicaDeudas"});
            XMLView.create({
              id: this.createId("myView"),
              viewName: "bafar.flujos.flujos.view.PensionesV.JuridicaDeudas"
            }).then(function (oView) {
                // the instance is available in the callback function
                oView.placeAt(oRef);
              }.bind(this));
            break;
          default:
            var oRef = this.getView().byId("headerFlujosInsertPanel2");
            var oController = sap.ui.core.mvc.Controller.create({name: "bafar.flujos.flujos.controller.PensionesC.DatosPersonales"});
            XMLView.create({
              id: this.createId("myView1"),
              viewName: "bafar.flujos.flujos.view.PensionesV.DatosPersonales"
            }).then(function (oView) {
                // the instance is available in the callback function
                oView.placeAt(oRef);
              }.bind(this));
            // this.myView1 = new sap.ui.xmlview({
            //   id: "myView1",
            //   viewName: "bafar.flujos.flujos.view.PensionesV.DatosPersonales"
            // });
            // var oRef = this.getView().byId("headerFlujosInsertPanel2");
            // this.myView1.placeAt(oRef);
            // break;
        }

      },
      delPanel: function (oEvent, param) {
        switch (param) {
          case "1":
            this.getView().byId("myView").destroy();
            // this.myView.destroy();
            break;

          default:
            this.getView().byId("myView1").destroy();
            break;
        }
      }
    });
  }
);
