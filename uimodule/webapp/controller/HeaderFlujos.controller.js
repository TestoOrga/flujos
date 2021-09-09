sap.ui.define(
  [
    "bafar/flujos/flujos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/XMLView",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text",
  ],
  function (BaseController,
    JSONModel,
    XMLView,
    MessageToast,
    MessageBox,
    Dialog,
    DialogType,
    Button,
    ButtonType,
    Text) {
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

        //eventlisteners
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.subscribe("flowResults", "flowValid", this.onFlowValid, this);
        oEventBus.subscribe("flowResults", "flowData", this.onFlowData, this);
      },
      /**
       * @override
       */
      onExit: function () {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.unsubscribe("flowResults", "flowValid", this.onFlowValid, this);
        oEventBus.unsubscribe("flowResults", "flowData", this.onFlowData, this);
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
      /**          

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
        console.log("Event handler: onAddFlow");
        var flowConfig = this.getModel("flowConfig").getData();
        var flowKey = this.headerData.departamento + this.headerData.actividad + this.headerData.proceso;
        // var flowKey = "001001001";
        var flowViews = flowConfig.find(x => x[flowKey]);
        if (flowViews) {
          this.addSpecFlow(flowViews[flowKey]);
          this.byId("headerFlujosButNuevo").setEnabled(false);
        } else {
          MessageBox.error(this.get18().getText("headerFlujosController.FlujoNoConfigurado"));
        }
      },
      // addSpecFlow1: function () {
      //   // if (!this.valHeaderInput()) {
      //   //   MessageBox.error(this.get18().getText("createFlowError"));
      //   //   return
      //   // }
      //   var oPayload = {
      //     P1: "CAT",
      //     P2: "ID",
      //     to_pesal: []
      //   };
      //   this.getCatData(oPayload).then((res) => {
      //     if (res.length > 0) {
      //       var id = res[0].C1;
      //       this.headerData.id = id;
      //       this.byId("headerFLujosIdFlujo").setText(id);
      //     }
      //   });
      //   console.log("Event Handler: onAddFlow");
      //   this.views = [{
      //     controlId: "headerFlujosInsertPanel1",
      //     controllerName: "bafar.flujos.flujos.controller.Tabla.FlujoTabla",
      //     viewId: "flujostabla",
      //     viewName: "bafar.flujos.flujos.view.Tabla.FlujoTabla"
      //   }];
      //   this.views.forEach((view) => {
      //     var oView = this.specificFlow(view.controlId, view.controllerName, view.viewId, view.viewName);
      //     console.log(view.viewId);
      //     oView.then((res) => {
      //       res.oView.placeAt(res.oRef).addStyleClass("headerPanel").addStyleClass("FlexContent");
      //     })
      //   });
      // },
      addSpecFlow: async function (flowConfig) {
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
        this.views = flowConfig;
        // [{
        //     controlId: "headerFlujosInsertPanel1",
        //     controllerName: "bafar.flujos.flujos.controller.PensionesC.DatosPersonales",
        //     viewId: "PensionesDatosPersonales",
        //     viewName: "bafar.flujos.flujos.view.PensionesV.DatosPersonales"
        //   },
        //   {
        //     controlId: "headerFlujosInsertPanel1",
        //     controllerName: "bafar.flujos.flujos.controller.PensionesC.JuridicaDeudas",
        //     viewId: "PensionesDatosJuridica",
        //     viewName: "bafar.flujos.flujos.view.PensionesV.Juridica"
        //   },
        //   {
        //     controlId: "headerFlujosInsertPanel1",
        //     controllerName: "bafar.flujos.flujos.controller.PensionesC.JuridicaDeudas",
        //     viewId: "PensionesDatosDeudas",
        //     viewName: "bafar.flujos.flujos.view.PensionesV.Deudas"
        //   },
        //   {
        //     controlId: "headerFlujosInsertPanel1",
        //     controllerName: "bafar.flujos.flujos.controller.Comunes.ArchivosExtra",
        //     viewId: "ArchivosExtra",
        //     viewName: "bafar.flujos.flujos.view.Comunes.ArchivosExtra"
        //   }
        // ];        
        var viewArr = [];
        this.views.forEach((view) => {
          viewArr.push(this.specificFlow(view.controlId, view.controllerName, view.viewId, view.viewName));
          console.log(view.viewId);
        });
        let values = await Promise.all(viewArr);
        values.forEach((element) => {
          element.oView.placeAt(element.oRef).addStyleClass("headerPanel").addStyleClass("FlexContent");
        });
        console.log();
      },

      valHeaderInput: function () {
        var noOk = true;
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
      onReset: function (oEvent, fn, text) {
        console.log("Event Handler: onReset");
        this.onConfirmDialogPress(fn ? fn : this.resetFlow.bind(this), text ? text : this.get18().getText("headerFlujos.ResetConfirmationQuestion"));
      },
      resetFlow: function () {
        delete this.valFlowStart;
        delete this.getFlowDataStart;
        this.clearHeader();
        this.setHeaderTitle(this.get18().getText("HeaderTitulo"));
        if (this.views) {
          this.views.forEach((view) => this.getView().byId(view.viewId).destroy());
          delete this.views;
        }
        this.byId("headerFlujosButNuevo").setEnabled(true);
      },
      onConfirmDialogPress: function (fn, text, risk) {
        this.oApproveDialog = new Dialog({
          type: DialogType.Message,
          icon: this.get18().getText("submitIcon"),
          title: this.get18().getText("submitConfirmation"),
          state: "Warning",
          afterClose: function () {
            this.oApproveDialog.destroy();
          }.bind(this),
          content: new Text({
            text: text
          }),
          beginButton: new Button({
            // type: ButtonType.Emphasized,
            icon: this.get18().getText("submitIconAccept"),
            type: risk ? sap.m.ButtonType.Accept : sap.m.ButtonType.Transparent,
            press: function () {
              fn();
              this.oApproveDialog.close();
            }.bind(this)
          }),
          endButton: new Button({
            icon: this.get18().getText("submitIconCancel"),
            type: risk ? sap.m.ButtonType.Reject : sap.m.ButtonType.Transparent,
            press: function () {
              this.oApproveDialog.close();
            }.bind(this)
          })
        });
        this.oApproveDialog.open();
      },
      clearHeader: function () {
        this.byId("headerFLujosIdFlujo").setText(this.get18().getText("headerFlujosIdPlaceholder"));
        $(".valHeaderInput").each((i, e) => {
          var domRef = document.getElementById(e.id);
          var oControl = $(domRef).control()[0];
          oControl.setSelectedKey("");
        });
      },

      // Crea vistas de acuerdo al flujo seleccionado
      specificFlow: async function (controlId, controllerName, viewId, viewName) {
        var oRef = this.getView().byId(controlId);
        var oController = sap.ui.core.mvc.Controller.create({
          name: controllerName
        });

        const fn = () => XMLView.create({
          id: this.createId(viewId),
          viewName: viewName
        });
        const oView = await this.getOwnerComponent().runAsOwner(fn);
        return {
          oView: oView,
          oRef: oRef
        };

      },
      onGrabar: function () {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("flowRequest", "valFlow");
      },
      onFlowValid: function (sChannel, oEvent, valOk) {
        if (!this.valFlowStart) {
          this.valFlowStart = sap.ui.getCore().getEventBus()._mChannels.flowRequest.mEventRegistry.valFlow.length;
          this.valFlowRes = [];
        }
        this.valFlowStart--;
        this.valFlowRes.push(valOk.res);
        if (this.valFlowStart === 0) {
          delete this.valFlowStart;
          var okFlow = true;
          this.valFlowRes.forEach(element => {
            if (!element) okFlow = false;
          });
          this.onConfirmDialogPress(this.submitFlow.bind(this), this.get18().getText("submitConfirmationQuestion"), true);

          // if (okFlow) {
          //   this.onConfirmDialogPress(this.submitFlow.bind(this), this.get18().getText("submitConfirmationQuestion"), true);
          // } else {
          //   MessageBox.error(this.get18().getText("headerFlujosController.CompleteTodosLosCampos"));
          // }
        };
      },
      submitFlow: function () {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("flowRequest", "flowData");
      },
      onFlowData: function (sChannel, oEvent, flowData) {
        if (!this.getFlowDataStart) {
          this.getFlowDataStart = sap.ui.getCore().getEventBus()._mChannels.flowRequest.mEventRegistry.valFlow.length;
          this.getFlowDataRes = [];
        }
        this.getFlowDataStart--;
        this.getFlowDataRes.push(flowData.res);
        if (this.getFlowDataStart === 0) {
        console.log();
          // if (flowData) {
        //   MessageToast.show({
        //     ...flowData
        //   });
        // }
        }
      },
      onCancelar: function () {
        this.onBack();
      },

      onBack: function (oEvent) {
        this.onReset(undefined, this.navBack.bind(this), this.get18().getText("headerFlujosController.ConfirmaCancelarFlujo"));
      },
      navBack: function () {
        this.clearHeader();
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteAccionView", null);
      },

      onPressDepartamento: function (oEvent) {
        var departamentoKey = oEvent.getSource().getSelectedKey();
        if (departamentoKey !== "") {
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
        } else {
          oEvent.getSource().setValueState("Error");
        }
      },

      onPressActividad: function (oEvent) {
        var actividadKey = oEvent.getSource().getSelectedKey();
        if (actividadKey !== "") {
          oEvent.getSource().setValueState("None");
          this.headerData.actividad = actividadKey
          var oDataEntry = {
            P1: "CAT",
            P2: "CAT3",
            P3: this.headerData.departamento,
            P4: oEvent.getSource().getSelectedKey(),
            to_pesal: []
          };
          this.getCatData(oDataEntry).then((res) => {
            var actividadModel = new JSONModel(res);
            this.setModel(actividadModel, "proceso");
          });
          this.byId("headerFlujosProceso").setEnabled(true);
        } else {
          oEvent.getSource().setValueState("Error");
        }
      },

      onPressProceso: function (oEvent) {
        var procesoKey = oEvent.getSource().getSelectedKey();
        if (procesoKey !== "") {
          oEvent.getSource().setValueState("None");
          this.headerData.proceso = procesoKey;
          this.headerData.titulo = oEvent.getSource().getSelectedItem().getBindingContext("proceso").getObject().C2;
          this.setHeaderTitle(this.headerData.titulo);
        } else {
          oEvent.getSource().setValueState("Error");
        }
      },
      setHeaderTitle: function (text) {
        this.byId("headerFlujosPageHeader").setObjectTitle(text);
      }
    });
  }
);