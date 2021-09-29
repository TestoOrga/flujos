sap.ui.define(
  [
    "bafar/flujos/flujos/controller/BaseController",
    "sap/ui/core/mvc/XMLView",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/Text",
    "sap/ui/core/Fragment",
  ],
  function (BaseController,
    XMLView,
    Dialog,
    DialogType,
    Button,
    MessageBox,
    JSONModel,
    Text,
    Fragment) {
    "use strict";

    return BaseController.extend(
      "bafar.flujos.flujos.controller.Aprobacion.AprobacionFlow", {
        /**
         * @override
         */
        onInit: function () {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter
            .getRoute("RouteApprovalFlowView")
            .attachPatternMatched((oEvent) => {
              var createFlow = false;
              if (this.lastHash) {
                console.log(
                  "Event Handler: attachPatternMatched " + this.lastHash
                );
                if (oEvent.getParameter("arguments").flow !== this.lastHash) {
                  this.resetFlow();
                  createFlow = true;
                }
              } else {
                createFlow = true;
              }
              if (createFlow) {
                this.lastHash = oEvent.getParameter("arguments").flow;
                console.log(
                  "Event Handler: attachPatternMatched " + this.lastHash
                );
                this.onPageLoaded(oEvent);
                this.mainModel = this.getModel();
                this.displayFlow();
              }
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
              },
            },
            this
          );

          //model
          this.setModel(new JSONModel({}), "viewBackModel");
          this.backModel = this.getModel("viewBackModel");
          this.setModel(new JSONModel({}), "viewBackModelFiles");
          this.backModelFiles = this.getModel("viewBackModelFiles");

          //eventlisteners
          this.oEventBus = this.getOwnerComponent().getEventBus();
          this.oEventBus.subscribe(
            "flowResults",
            "flowValid",
            this.onFlowValid,
            this
          );
          this.oEventBus.subscribe(
            "flowResults",
            "flowData",
            this.onFlowData,
            this
          );
          this.oEventBus.subscribe(
            "flowCreation",
            "flowBackResult",
            this.onFlowBackResult,
            this
          );
          this.oEventBus.subscribe(
            "flowCreated",
            "EndFlow",
            this.onEndflow,
            this
          );
        },
        /**
         * @override
         */
        onExit: function () {
          this.getView().destroy();
          this.oEventBus.unsubscribe(
            "flowResults",
            "flowValid",
            this.onFlowValid,
            this
          );
          this.oEventBus.unsubscribe(
            "flowResults",
            "flowData",
            this.onFlowData,
            this
          );
          this.oEventBus.unsubscribe(
            "flowCreation",
            "flowBackResult",
            this.onFlowBackResult,
            this
          );
          this.oEventBus.unsubscribe(
            "flowCreated",
            "EndFlow",
            this.onEndflow,
            this
          );
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
        onPageLoaded: function (oEvent) {
          this.oUserCode = oEvent.getParameter("arguments").flow;
          this.setView();
        },
        setView: function () {
          // this.byId("panelId").setHeaderText(this.oUserCode);
          this.setModel(
            this.getOwnerComponent().getAprovalModel(),
            "viewModel"
          );
        },
        displayFlow: function () {
          this.getFlowData()
            .then((response) => this.distributeData(response))
            .then(() => this.onAddFlow())
            .then(() => {
              console.log('send data to view controllers');
              this.oEventBus.publish("flowApproval", "loadFlowData", {
                res: this.backModel.getData()
              });
              this.oEventBus.publish("flowApproval", "loadFlowFiles", {
                res: this.backModelFiles.getData()
              });
            })
            .catch((error) => {
              MessageBox.error(error.responseText || error.message);
            });
        },
        onAddFlow: function () {
          console.log("Event handler: onAddFlow");
          var flowConfig = this.getModel("flowConfig").getData();
          var flowKey = this.headerData.departamento + this.headerData.actividad + this.headerData.proceso;
          // var flowKey = this.oUserCode.includes("x") ?
          //   "NOM001002" :
          //   "NOM001001";
          var flowViews = flowConfig.find((x) => x[flowKey]);
          if (flowViews) {
            return this.addSpecFlow(flowViews[flowKey])
            // this.byId("headerFlujosButNuevo").setEnabled(false);
          } else {
            return MessageBox.error(
              this.get18().getText("headerFlujosController.FlujoNoConfigurado")
            );
          }
        },

        getFlowData: function () {
          this.createModel = this.getModel("createModel");
          var oPayload = {
            P1: "APPDET",
            // P2: "SY-UNAME",
            P2: "E",
            to_pesal: [{
              C2: this.lastHash,
            }, ],
          };
          return new Promise((resolve, reject) => {
            this.createModel.create("/BaseSet", oPayload, {
              async: true,
              success: function (req, res) {
                var res = res.data.to_pesal.results;
                resolve(res);
              },
              error: function (error) {
                reject(error);
              },
            });
          });
        },

        distributeData: function (oResults) {
          if (oResults.length !== 0) {
            var flows = oResults.filter(x => isNaN(x.C1));
            var files = oResults.filter(x => !isNaN(Number(x.C1)));
            files.forEach((element) => {
              var owner = flows.find(x =>
                x.C6 === element.C1);
              element.itemOwner = owner.C31;
            });
            this.backModel.setProperty("/", flows);
            this.backModelFiles.setProperty("/", files);
            // this.setModel(new JSONModel(oResults), "viewBackModel");
            this.mapFlowConfig(flows[0]);
            this.mapHeader(flows[0]);
            // this.setModel(new JSONModel(res.data.to_pesal.results), "lazyModel");
            // this.tabModel = that.getModel("lazyModel");
            // this.setHeaderTitle(res.data.P2);
          } else {
            throw { message: this.get18().getText("AprobacionFlowController.NoHayInformacionDelFlujo") };
          }
        },

        mapFlowConfig: function (oFlowConfig) {
          this.headerData.departamento = oFlowConfig.C1;
          this.headerData.actividad = oFlowConfig.C2;
          this.headerData.proceso = oFlowConfig.C3;
        },
        mapHeader: function (oFlowData) {
          var headerData = {
            flowCode: oFlowData.C1 + oFlowData.C2 + oFlowData.C3,
            title: oFlowData.C5,
            intro: oFlowData.C4,
            icon: oFlowData.C1,
            stateText: "Por Aprobar",
            state: "Warning",
            name: oFlowData.C24,
            subName: oFlowData.C25,
            subName1: oFlowData.C26,

            rejectText: ""
          };
          this.getModel("viewModel").setProperty("/", headerData);
        },
        addSpecFlow: async function (flowConfig) {
          console.log("Event Handler: onAddFlow");
          this.views = flowConfig;
          var viewArr = [];
          this.views.forEach((view) => {
            viewArr.push(
              this.specificFlow(
                "panelId",
                view.controllerName,
                view.viewId,
                view.viewName
              )
            );
            console.log(view.viewId);
          });
          let values = await Promise.all(viewArr);
          values.forEach((element) => {
            element.oView
              .placeAt(element.oRef)
              .addStyleClass("headerPanel")
              .addStyleClass("FlexContent");
          });
          return console.log('VIEWS LOADED!');
        },

        onReset: function (oEvent, fn, text) {
          console.log("Event Handler: onReset");
          this.onConfirmDialogPress(
            fn ? fn : this.resetFlow.bind(this),
            text ?
            text :
            this.get18().getText("headerFlujos.ResetConfirmationQuestion")
          );
        },
        resetFlow: function () {
          delete this.valFlowStart;
          delete this.getFlowDataStart;
          // this.clearHeader();
          // this.setHeaderTitle(this.get18().getText("HeaderTitulo"));
          if (this.views) {
            this.views.forEach((view) =>
              this.getView().byId(view.viewId).destroy()
            );
            delete this.views;
          }
          // this.byId("headerFlujosButNuevo").setEnabled(true);
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
              text: text,
            }),
            beginButton: new Button({
              // type: ButtonType.Emphasized,
              icon: this.get18().getText("submitIconAccept"),
              type: risk ?
                sap.m.ButtonType.Accept : sap.m.ButtonType.Transparent,
              press: function () {
                fn();
                this.oApproveDialog.close();
              }.bind(this),
            }),
            endButton: new Button({
              icon: this.get18().getText("submitIconCancel"),
              type: risk ?
                sap.m.ButtonType.Reject : sap.m.ButtonType.Transparent,
              press: function () {
                this.oApproveDialog.close();
              }.bind(this),
            }),
          });
          this.oApproveDialog.open();
        },
        specificFlow: async function (
          controlId,
          controllerName,
          viewId,
          viewName
        ) {
          var oRef = this.getView().byId(controlId);
          var oController = sap.ui.core.mvc.Controller.create({
            name: controllerName,
          });
          const fn = () =>
            XMLView.create({
              id: this.createId(viewId),
              viewName: viewName,
            });
          const oView = await this.getOwnerComponent().runAsOwner(fn);
          return {
            oView: oView,
            oRef: oRef,
          };
        },

        clearHeader: function () {
          this.byId("headerFLujosIdFlujo").setText(
            this.get18().getText("headerFlujosIdPlaceholder")
          );
          $(".valHeaderInput").each((i, e) => {
            var domRef = document.getElementById(e.id);
            var oControl = $(domRef).control()[0];
            oControl.setSelectedKey("");
          });
        },

        submitFlow: function () {
          this.oEventBus.publish("flowRequest", "flowDataApprove");
        },

        /* ===========================================================
         Internal Main Actions
        ============================================================= */
        // Crea vistas de acuerdo al flujo seleccionado
        onAprobar: function () {
          this.oEventBus.publish("flowRequest", "valFlow");
        },
        onCancelar: function () {
          this.onBack();
        },

        /* ===========================================================
         External Event Handlers
        ============================================================= */
        onFlowValid: function (sChannel, oEvent, valOk) {
          if (!this.valFlowStart) {
            this.valFlowStart =
              this.oEventBus._mChannels.flowRequest.mEventRegistry.valFlow.length;
            this.valFlowRes = [];
          }
          this.valFlowStart--;
          this.valFlowRes.push(valOk.res);
          if (this.valFlowStart === 0) {
            delete this.valFlowStart;
            var okFlow = true;
            this.valFlowRes.forEach((element) => {
              if (!element) okFlow = false;
            });
            // this.onConfirmDialogPress(this.submitFlow.bind(this), this.get18().getText("submitConfirmationQuestion"), true);

            if (okFlow) {
              this.onConfirmDialogPress(
                this.submitFlow.bind(this),
                this.get18().getText("AprobacionFlowController.DeseaProcesarElFlujo"),
                true
              );
            } else {
              MessageBox.error(
                this.get18().getText(
                  "headerFlujosController.CompleteTodosLosCampos"
                )
              );
            }
          }
        },
        onFlowData: function (sChannel, oEvent, flowData) {
          if (!this.getFlowDataStart) {
            this.getFlowDataStart =
              this.oEventBus._mChannels.flowRequest.mEventRegistry.valFlow.length;
            this.getFlowDataRes = [];
          }
          this.getFlowDataStart--;
          if (flowData.typeArr) {
            flowData.res.forEach((element) => {
              this.getFlowDataRes.push(element);
            });
          } else {
            this.getFlowDataRes = {
              ...this.getFlowDataRes,
              ...flowData.res,
            };
          }
          if (this.getFlowDataStart === 0) {
            console.log("eventEnded");
            this.byId("approvePage").setBusy(true);
            this.getOwnerComponent().oSendData.mapData(
              // { flowInfo: {
              //   departamento: this.headerData.departamento,
              //   actividad: this.headerData.actividad,
              //   proceso: this.headerData.proceso,
              //   id: this.headerData.id,
              // },
              // flowData: this.getFlowDataRes }
              this.addModification(), this.getFlowCode());
          }
        },
        getFlowCode: function () {
          var backData = this.backModel.getData();
          return backData[0].C1 + backData[0].C2 + backData[0].C3;
        },
        addModification: function () {
          var backData = this.backModel.getData();
          backData.forEach(backItem => {
            if (Array.isArray(this.getFlowDataRes)) {
              var modData = this.getFlowDataRes.find(x => x.C30 === backItem.C30);
              for (const key in modData) {
                backItem[key] = modData[key];
              }
            } else {
              for (const key in this.getFlowDataRes) {
                backItem[key] = this.getFlowDataRes[key];
              }
            }
            backItem.C88 = this.lastHash;
          });

          var flowCode = this.getModel("viewModel").getProperty("/flowCode");
          if (this.getOwnerComponent().noTabFlows.includes(flowCode)) {
            var localReject = this.getModel("viewModel").getProperty("/rejectText");
            backData[0].C16 = localReject === "" ? "X" : "";
            backData[0].C20 = localReject;
          }
          return backData;
        },
        onFlowBackResult: function (sChannel, oEvent, res) {
          this.byId("approvePage").setBusy(false);
          if (!res) {
            MessageBox.error(error.responseText);
          }

          if (res.PeTmsj === "E") {
            this.oEventBus.publish("flowResult", "dataError", {
              res: res,
            });
          } else {
            var modelData = this.getModel("viewModel").getData();
            var messText = this.get18().getText(
              "AprobacionFlowController.FlujoAprobado",
              [modelData.title]
            );
            MessageBox.success(messText);
            modelData.stateText = "Aprobado";
            modelData.state = "Success";
            this.getModel("viewModel").setProperty("/", modelData);
            // this.oEventBus.publish("flowCreated", "releaseFiles");
          }
        },
        onEndflow: function () {
          this.resetFlow();
        },

        /* ===========================================================
         Navigation
         ============================================================= */
        navBack: function () {
          // this.clearHeader();
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteApprovalView", null);
        },

        approveEdit: function (oEvent) {
          if (oEvent.getParameter("pressed")) {
            this.flowModified = true;
          }
          this.oEventBus.publish("flowApproval", "editMode", {
            edit: oEvent.getParameter("pressed")
          });
        },

        onBack: function (oEvent) {
          this.onReset(
            undefined,
            this.navBack.bind(this),
            this.get18().getText("AprobacionFlowController.ConfirmaCancelarTratamientoDeFlujo")
          );
        },
        switchChanged: function (oEvent) {
          // var lineCxt = oEvent.oSource.getBindingContext(this.viewConfig.tabModelName);
          if (!oEvent.oSource.getState()) {
            // this.setModel(new JSONModel({
            //   // tabLine: oEvent.getSource().getParent().getParent(),
            //   // line: lineCxt,
            //   rejectText: ""
            // }), "fragMotive");
            this.displayMotivePopOver(this.getModel("viewModel").getProperty("/title"));
          } else {
            this.getModel("viewModel").setProperty("/rejectText", "")
            // this.getModel("viewModel").refresh(true);
            this.byId("fragMotiveText").setValue("");
            // this.headerData.rejectText = "";
            // this._tabModel.setProperty(lineCxt.sPath + "/rejectText", "");
            // this.getModel("fragMotive").setProperty("/", "");
          }
          // {vis1: "000001", in1: "211020", vis2: "URQUIDI CHAVEZ JUAN …", vis3: "B2", vis4: "20050316", …}

        },
        displayMotivePopOver: function (itemId) {
          var oView = this.getView();
          if (!this.byId("motiveDialog")) {
            Fragment.load({
              id: oView.getId(),
              name: "bafar.flujos.flujos.view.fragments.viewMotivePopUp",
              controller: this,
            }).then(
              function (oDialog) {
                // connect dialog to the root view of this component (models, lifecycle)
                oView.addDependent(oDialog);
                oView.byId("motiveDialog").setTitle("Item No: " + itemId);
                console.log("Frag Loaded");
                oDialog.open();
              }.bind(this)
            );
          } else {
            oView.byId("motiveDialog").setTitle("Item No: " + itemId);
            oView.byId("motiveDialog").open();
          }
        },
        acceptRejectComment: function (oEvent) {
          // var line = this.getModel("fragMotive").getData();
          // this._tabModel.setProperty(line.line.sPath + "/rejectText", line.rejectText);
          this.getModel("viewModel").setProperty("/rejectText", this.byId("fragMotiveText").getValue());
          this.byId("motiveDialog").close();
        },

        _showMotivo: function (oEvent) {
          // var lineCxt = oEvent.oSource.getBindingContext(this.viewConfig.tabModelName);
          // this.setModel(new JSONModel({
          //   line: lineCxt,
          //   rejectText: lineCxt.getObject().rejectText
          // }), "fragMotive");
          this.byId("fragMotiveText").setValue(this.getModel("viewModel").getProperty("/rejectText"));
          this.displayMotivePopOver(this.getModel("viewModel").getProperty("/title"));
        },

        afterRejectClose: function (oEvent) {
          if (this.byId("fragMotiveText").getValue() === "") {
            this.byId("switchito").setState(true);
            this.getModel("viewModel").setProperty("/rejectText", "");
          }
        }

        /* ===========================================================
         BORRAR
        ============================================================= */

        // onPressDepartamento: function (oEvent) {
        //   var departamentoKey = oEvent.getSource().getSelectedKey();
        //   if (departamentoKey !== "") {
        //     oEvent.getSource().setValueState("None");
        //     this.headerData.departamento = departamentoKey;
        //     var oDataEntry = {
        //       P1: "CAT",
        //       P2: "CAT2",
        //       P3: oEvent.getSource().getSelectedKey(),
        //       to_pesal: [],
        //     };
        //     this.getCatData(oDataEntry).then((res) => {
        //       var actividadModel = new JSONModel(res);
        //       this.setModel(actividadModel, "actividad");
        //     });
        //     this.byId("headerFlujosActiv").setEnabled(true);
        //   } else {
        //     oEvent.getSource().setValueState("Error");
        //   }
        // },

        // onPressActividad: function (oEvent) {
        //   var actividadKey = oEvent.getSource().getSelectedKey();
        //   if (actividadKey !== "") {
        //     oEvent.getSource().setValueState("None");
        //     this.headerData.actividad = actividadKey
        //     var oDataEntry = {
        //       P1: "CAT",
        //       P2: "CAT3",
        //       P3: this.headerData.departamento,
        //       P4: oEvent.getSource().getSelectedKey(),
        //       to_pesal: []
        //     };
        //     this.getCatData(oDataEntry).then((res) => {
        //       var actividadModel = new JSONModel(res);
        //       this.setModel(actividadModel, "proceso");
        //     });
        //     this.byId("headerFlujosProceso").setEnabled(true);
        //   } else {
        //     oEvent.getSource().setValueState("Error");
        //   }
        // },

        // onPressProceso: function (oEvent) {
        //   var procesoKey = oEvent.getSource().getSelectedKey();
        //   if (procesoKey !== "") {
        //     oEvent.getSource().setValueState("None");
        //     this.headerData.proceso = procesoKey;
        //     this.headerData.titulo = oEvent.getSource().getSelectedItem().getBindingContext("proceso").getObject().C2;
        //     this.setHeaderTitle(this.headerData.titulo);
        //   } else {
        //     oEvent.getSource().setValueState("Error");
        //   }
        // },
        // setHeaderTitle: function (text) {
        //   this.byId("headerFlujosPageHeader").setObjectTitle(text);
        // }
      }
    );
  }
);