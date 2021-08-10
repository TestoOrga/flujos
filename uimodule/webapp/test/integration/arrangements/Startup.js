sap.ui.define(["sap/ui/test/Opa5"], function (Opa5) {
    "use strict";

    return Opa5.extend("bafar.flujos.flujos.test.integration.arrangements.Startup", {
        iStartMyApp: function () {
            this.iStartMyUIComponent({
                componentConfig: {
                    name: "bafar.flujos.flujos",
                    async: true,
                    manifest: true
                }
            });
        }
    });
});
