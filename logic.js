const theta0 = Math.PI / 2;
let state = null;

$(document).ready(function () {
    initPyodideEngine(function (py) {
        $("#loading").fadeOut();
        $("#screen").fadeIn();

        getState0 = function (theta) {
            const fn = py.get("getState0");
            const opStr = fn(theta);
            return JSON.parse(opStr);
        }
        state = getState0(theta0);
        console.log("State 0 =", JSON.stringify(state));
    });

    $("#rot").on("input change", function () {
        $("#rot_disp").html($(this).val());
    });

    $("#btnApplyRotation").click(function () {
        const qubitIndex = $("#qubit_index").val();
        const axis = $("#axis").val();
        const rot = $("#rot").val();
        applyRotation(qubitIndex, axis, rot);
    });
});

let getState0 = null;

function applyRotation(qubitIndex, axis, rot) {

}