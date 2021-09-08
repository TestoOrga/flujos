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
        console.log("Event handler: onAddFlow");
        if (this.headerData.proceso === "001") {
          this.addSpecFlow();
        } else {
          this.addSpecFlow1();
        }
        this.byId("headerFlujosButNuevo").setEnabled(false);
      },
      addSpecFlow1: function () {
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
          controllerName: "bafar.flujos.flujos.controller.Tabla.FlujoTabla",
          viewId: "flujostabla",
          viewName: "bafar.flujos.flujos.view.Tabla.FlujoTabla"
        }];
        // var time = 0;
        this.views.forEach((view) => {
          // setTimeout(() => {
          var oView = this.specificFlow(view.controlId, view.controllerName, view.viewId, view.viewName);
          console.log(view.viewId);
          oView.then((res) => {
            res.oView.placeAt(res.oRef).addStyleClass("headerPanel").addStyleClass("FlexContent");
          })
          // }, time);
          // time = time + 1000;
        });
      },
      addSpecFlow: async function () {
        if (!this.valHeaderInput()) {
          MessageBox.error(this.get18().getText("createFlowError"));
          return
        }
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
          },
          {
            controlId: "headerFlujosInsertPanel1",
            controllerName: "bafar.flujos.flujos.controller.Comunes.ArchivosExtra",
            viewId: "ArchivosExtra",
            viewName: "bafar.flujos.flujos.view.Comunes.ArchivosExtra"
          }
        ];
        // var time = 0;
        var viewArr = [];
        this.views.forEach((view) => {
          //   setTimeout(() => {
          viewArr.push(this.specificFlow(view.controlId, view.controllerName, view.viewId, view.viewName));
          console.log(view.viewId);
          // }, time);
          // time = time + 1000;
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
        this.clearHeader();
        this.setHeaderTitle(this.get18().getText("HeaderTitulo"));
        if (this.views) {
          this.views.forEach((view) => this.getView().byId(view.viewId).destroy());
          delete this.views;
        }
        this.byId("headerFlujosButNuevo").setEnabled(true);
      },
      onConfirmDialogPress: function (fn, text) {
        this.oApproveDialog = new Dialog({
          type: DialogType.Message,
          icon: this.get18().getText("submitIcon"),
          title: this.get18().getText("submitConfirmation"),
          state: "Warning",
          content: new Text({
            text: text
          }),
          beginButton: new Button({
            // type: ButtonType.Emphasized,
            icon: this.get18().getText("submitIconAccept"),
            // type: sap.m.ButtonType.Accept,
            press: function () {
              fn();
              this.oApproveDialog.close();
            }.bind(this)
          }),
          endButton: new Button({
            icon: this.get18().getText("submitIconCancel"),
            // type: sap.m.ButtonType.Reject,
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
      specificFlow: async function (controlId, controllerName, viewId, viewName) {
        var oRef = this.getView().byId(controlId);
        var oController = sap.ui.core.mvc.Controller.create({
          name: controllerName
        });

        // XMLView.create({
        //   id: this.createId(viewId),
        //   viewName: viewName
        // }).then(function (oView) {
        //   // the instance is available in the callback function
        //   oView.placeAt(oRef).addStyleClass("headerPanel").addStyleClass("FlexContent");
        // }.bind(this))               
        const fn = () => XMLView.create({
          id: this.createId(viewId),
          viewName: viewName
        });
        const oView = await this.getOwnerComponent().runAsOwner(fn);
        return {
          oView: oView,
          oRef: oRef
        };
        // oView.placeAt(oRef).addStyleClass("headerPanel").addStyleClass("FlexContent");

      },
      onGrabar: function () {
        this.onApproveDialogPress();
      },
      onApproveDialogPress: function () {
        if (!this.oApproveDialog) {
          this.oApproveDialog = new Dialog({
            type: DialogType.Message,
            icon: this.get18().getText("submitIcon"),
            title: this.get18().getText("submitConfirmation"),
            state: "Warning",
            content: new Text({
              text: this.get18().getText("submitConfirmationQuestion")
            }),
            beginButton: new Button({
              type: ButtonType.Emphasized,
              icon: this.get18().getText("submitIconAccept"),
              type: sap.m.ButtonType.Accept,
              press: function () {
                this.submitFlow();
                this.oApproveDialog.close();
              }.bind(this)
            }),
            endButton: new Button({
              icon: this.get18().getText("submitIconCancel"),
              type: sap.m.ButtonType.Negative,
              press: function () {
                this.oApproveDialog.close();
              }.bind(this)
            })
          });
        }
        this.oApproveDialog.open();
      },

      submitFlow: function () {
        MessageToast.show("Flujo enviado para creacion");
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