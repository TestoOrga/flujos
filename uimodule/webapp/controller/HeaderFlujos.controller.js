sap.ui.define(
  [
    "bafar/flujos/flujos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/XMLView",
    "sap/m/MessageToast"
  ],
  function (Controller, JSONModel, XMLView, MessageToast) {
    "use strict";

    return Controller.extend("bafar.flujos.flujos.controller.MainView", {
      onInit: function () {
        var oFlujo = new JSONModel({
          seccion1: this.getResourceBundle().getText(
            "Pensiones.DatosPersonales.panel"
          ),
          seccion2: this.getResourceBundle().getText(
            "Pensiones.Juridico.panel"
          ),
          seccion3: this.getResourceBundle().getText(
            "Pensiones.Deudas.panel"
          ),
        });
        this.getView().setModel(oFlujo, "flujo");
      },
      onAddFlow: function (oEvent) {
        console.log("Event Handler: onAddFlow");
        this.views = [
          {
            controlId: "headerFlujosInsertPanel1",
            controllerName: "bafar.flujos.flujos.controller.PensionesC.DatosPersonales",
            viewId: "PensionesDatosPersonales",
            viewName: "bafar.flujos.flujos.view.PensionesV.DatosPersonales"
          },
          {
            controlId: "headerFlujosInsertPanel2",
            controllerName: "bafar.flujos.flujos.controller.PensionesC.JuridicaDeudas",
            viewId: "PensionesDatosJuridica",
            viewName: "bafar.flujos.flujos.view.PensionesV.Juridica"
          },
          {
            controlId: "headerFlujosInsertPanel3",
            controllerName: "bafar.flujos.flujos.controller.PensionesC.JuridicaDeudas",
            viewId: "PensionesDatosDeudas",
            viewName: "bafar.flujos.flujos.view.PensionesV.Deudas"
          }
        ];
        this.views.forEach((view) => {
          this.specificFlow(view.controlId, view.controllerName, view.viewId, view.viewName);
        });
         
      },
      onReset: function (oEvent) {
        console.log("Event Handler: onReset");
        var that = this;
          this.views.forEach((view) =>
            this.getView().byId(view.viewId).destroy());
      },
      specificFlow: function (controlId, controllerName, viewId, viewName) {
        var oRef = this.getView().byId(controlId);
        var oController = sap.ui.core.mvc.Controller.create({ name: controllerName });
        XMLView.create({
          id: this.createId(viewId),
          viewName: viewName
        }).then(function (oView) {
          // the instance is available in the callback function
          oView.placeAt(oRef);
        }.bind(this));
      },
      onGrabar: function () {
        this.getView().byId("headerFlujosPageSec3").setVisible(true);
        var mainModel = this.getModel();
        var oEntityData = {
          P1: "CAT",
          P2: "BUKRS",
          // P2: "PERNR",
          to_pesal: []
        };
        mainModel.create("/BaseSet", oEntityData, {
          async: true,
          success: function (req, res) {
            console.log({ res });
            MessageToast.show( res );
          },
          error: function (error) {
            console.log({ error });
          }
        })
      },
      onCancelar: function () {        
      }



      // addPanel: function (oEvent, param) {
      //   switch (param) {
      //     case "1":
      //       var oRef = this.getView().byId("headerFlujosInsertPanel2");
      //       var oController = sap.ui.core.mvc.Controller.create({ name: "bafar.flujos.flujos.controller.PensionesC.JuridicaDeudas" });
      //       XMLView.create({
      //         id: this.createId("myView"),
      //         viewName: "bafar.flujos.flujos.view.PensionesV.JuridicaDeudas"
      //       }).then(function (oView) {
      //         // the instance is available in the callback function
      //         oView.placeAt(oRef);
      //       }.bind(this));
      //       break;
      //     default:
      //       var oRef = this.getView().byId("headerFlujosInsertPanel2");
      //       var oController = sap.ui.core.mvc.Controller.create({ name: "bafar.flujos.flujos.controller.PensionesC.DatosPersonales" });
      //       XMLView.create({
      //         id: this.createId("myView1"),
      //         viewName: "bafar.flujos.flujos.view.PensionesV.DatosPersonales"
      //       }).then(function (oView) {
      //         // the instance is available in the callback function
      //         oView.placeAt(oRef);
      //       }.bind(this));
      //     // this.myView1 = new sap.ui.xmlview({
      //     //   id: "myView1",
      //     //   viewName: "bafar.flujos.flujos.view.PensionesV.DatosPersonales"
      //     // });
      //     // var oRef = this.getView().byId("headerFlujosInsertPanel2");
      //     // this.myView1.placeAt(oRef);
      //     // break;
      //   }

      // },
      // delPanel: function (oEvent, param) {
      //   switch (param) {
      //     case "1":
      //       this.getView().byId("myView").destroy();
      //       // this.myView.destroy();
      //       break;

      //     default:
      //       this.getView().byId("myView1").destroy();
      //       break;
      //   }
      // }
    });
  }
);
