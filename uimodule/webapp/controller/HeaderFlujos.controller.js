sap.ui.define(
  [
    "bafar/flujos/flujos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/XMLView",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
  ],
  function (BaseController,
    JSONModel,
    XMLView,
    MessageToast,
    MessageBox) {
    "use strict";

    return BaseController.extend("bafar.flujos.flujos.controller.HeaderFlujos", {
      onInit: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.getRoute("RouteHeaderFlujosView").attachPatternMatched((oEvent) => {
          console.log("loaded");
          this.mainModel = this.getModel();
          this.getCatData(this.getDepartamento()).then((res) => {
            var depModel = new JSONModel(res);
            this.setModel(depModel, "departamento");
            console.log("departamentoLoaded");
          });
        }, this);
        this.headerData = {};
        this.getView().addEventDelegate({
          onBeforeHide: function (oEvent) {
            console.log("BeforeHide");
          },
          onAfterHide: function (oEvent) {
            console.log("AfterHide");
          },
          onDisplay: function (oEvent) {
            console.log("display");
          }
        }, this);
        var oFlujo = new JSONModel({
          seccion1: this.get18().getText(
            "Pensiones.DatosPersonales.panel"
          ),
          seccion2: this.get18().getText(
            "Pensiones.Juridico.panel"
          ),
          seccion3: this.get18().getText(
            "Pensiones.Deudas.panel"
          ),
        });
        this.getView().setModel(oFlujo, "flujo");
      },

      getDepartamento: function () {
        var oEntityData = {
          P1: "CAT",
          P2: "CAT1",
          to_pesal: []
        };
        return oEntityData;
      },
      getCatData: function (oPayload) {
        var that = this;
        return new Promise((resolve, reject) => {
          this.mainModel.create("/BaseSet", oPayload, {
            async: true,
            success: function (req, res) {
              resolve(res.data.to_pesal.results);
            },
            error: function (error) {
              reject(error);
            }
          });
        })
      },
      /**
       * @override
       */
      onAfterRendering: function (oEvent) {

        console.log("AfterRendering");

      },
      /**
       * @override
       */
      onBeforeRendering: function (oEvent) {

        console.log("BeforeRendering");

      },
      /**          this.mainModel = this.getModel();

       * @override
       */
      onExit: function () {
        console.log("Exit");
        this.getView().destroy();
      },
      onPageLoaded: function (oEvent) {
        this.oUserCode = oEvent.getParameter("arguments").code;
      },
      onAddFlow: function (oEvent) {
        // if (!this.valHeaderInput()) {
        //   MessageBox.error(this.get18().getText("createFlowError"));
        //   return
        // }
        var oPayload = {
          P1: "CAT",
          P2: "ID",
          to_pesal: []
        };
        this.getCatData(oPayload).then((res) => {
          if (res.length > 0) {
            var id = res[0].C1;
            this.headerData.id = id;
            this.byId("headerFLujosIdFlujo").setText(id);
          }
        });
        console.log("Event Handler: onAddFlow");
        this.views = [{
            controlId: "headerFlujosInsertPanel1",
            controllerName: "bafar.flujos.flujos.controller.PensionesC.DatosPersonales",
            viewId: "PensionesDatosPersonales",
            viewName: "bafar.flujos.flujos.view.PensionesV.DatosPersonales"
          },
          {
            controlId: "headerFlujosInsertPanel1",
            controllerName: "bafar.flujos.flujos.controller.PensionesC.JuridicaDeudas",
            viewId: "PensionesDatosJuridica",
            viewName: "bafar.flujos.flujos.view.PensionesV.Juridica"
          },
          {
            controlId: "headerFlujosInsertPanel1",
            controllerName: "bafar.flujos.flujos.controller.PensionesC.JuridicaDeudas",
            viewId: "PensionesDatosDeudas",
            viewName: "bafar.flujos.flujos.view.PensionesV.Deudas"
          }
        ];
        var time = 0;
        this.views.forEach((view) => {
          setTimeout(() => {
            this.specificFlow(view.controlId, view.controllerName, view.viewId, view.viewName);
            console.log(view.viewId);
          }, time);
          time = time + 1000;
        });

      },

      valHeaderInput: function () {
        var noOk;
        $(".valHeaderInput").each((i, e) => {
          var domRef = document.getElementById(e.id);
          var oControl = $(domRef).control()[0];
          if (oControl.getValue() === "") {
            oControl.setValueState("Error");
            noOk = false;
          };
        });
        return noOk;
      },
      onReset: function (oEvent) {
        console.log("Event Handler: onReset");
        var that = this;
        this.views.forEach((view) =>
          this.getView().byId(view.viewId).destroy());
      },
      specificFlow: function (controlId, controllerName, viewId, viewName) {
        var oRef = this.getView().byId(controlId);
        var oController = sap.ui.core.mvc.Controller.create({
          name: controllerName
        });
        XMLView.create({
          id: this.createId(viewId),
          viewName: viewName
        }).then(function (oView) {
          // the instance is available in the callback function
          oView.placeAt(oRef).addStyleClass("headerPanel").addStyleClass("FlexContent");
        }.bind(this));
      },
      onGrabar: function () {

      },
      onCancelar: function () {},

      onBack: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteAccionView", null);
      },

      onPressDepartamento: function (oEvent) {
        var departamentoKey = oEvent.getSource().getSelectedKey();
        // if (departamentoKey !== "") {
        oEvent.getSource().setValueState("None");
        this.headerData.departamento = departamentoKey;
        var oDataEntry = {
          P1: "CAT",
          P2: "CAT2",
          P3: oEvent.getSource().getSelectedKey(),
          to_pesal: []
        };
        this.getCatData(oDataEntry).then((res) => {
          var actividadModel = new JSONModel(res);
          this.setModel(actividadModel, "actividad");
        });
        this.byId("headerFlujosActiv").setEnabled(true);
        // } else {
        //   oEvent.getSource().setValueState("Error");
        // }
      },

      onPressActividad: function (oEvent) {
        var actividadKey = oEvent.getSource().getSelectedKey();
        // if (departamentoKey !== "") {
        oEvent.getSource().setValueState("None");
        this.headerData.actividad = actividadKey
        var oDataEntry = {
          P1: "CAT",
          P2: "CAT2",
          P3: this.headerData.departamento,
          P4: oEvent.getSource().getSelectedKey(),
          to_pesal: []
        };
        this.getCatData(oDataEntry).then((res) => {
          var actividadModel = new JSONModel(res);
          this.setModel(actividadModel, "proceso");
        });
        this.byId("headerFlujosProceso").setEnabled(true);
        // } else {
        //   oEvent.getSource().setValueState("Error");
        // }
      },

      onPressProceso: function (oEvent) {
        var procesoKey = oEvent.getSource().getSelectedKey();
        // if (departamentoKey !== "") {
        oEvent.getSource().setValueState("None");
        this.headerData.proceso = procesoKey;
        // } else {
        //   oEvent.getSource().setValueState("Error");
        // }
      }
    });
  }
);