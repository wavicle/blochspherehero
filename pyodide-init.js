/**
 * Core engine initialization.
 * Contains all internal states securely within its execution context.
 */
async function initPyodideEngine(callback) {
    try {
        const pyodide = await loadPyodide();
        await pyodide.loadPackage(["numpy", "scipy"]);

        const localScope = pyodide.globals.get("dict")();
        const pyRegistry = await pyodide.runPythonAsync(pythonCode, { globals: localScope });
        callback(pyRegistry);
        pyRegistry.destroy();
        localScope.destroy();
    } catch (err) {
        console.error("Initialization failed:", err);
        alert("Failed to initialize Pyodide engine.");
    }
}
