export const isDeno = typeof Deno !== "undefined" && typeof Deno.version !== "undefined";
export const isBun = typeof Bun !== "undefined" && typeof Bun.version !== "undefined";
if (!(isDeno || isBun)) {
    throw new Error("Unsupported runtime");
}
const os = isDeno ? Deno.build.os : process.platform;
const arch = isDeno ? Deno.build.arch : process.arch;
if (!(os == "windows" || os == "win32" || os == "linux" || os == "darwin")) {
    throw new Error(`Unsupported platform: ${os}`);
}
if (
    !(arch == "x64" || arch == "x86_64" || arch == "arm64" || arch == "aarch64")
) {
    throw new Error(`Unsupported architecture: ${arch}`);
}
let path: string;
if (os == "windows" || os == "win32") {
    if (arch == "x64" || arch == "x86_64") {
        const win32_x64 = await import(
            "@lazy_engineer/tokenizers-huggingface-win32-x64"
        );
        path = win32_x64.path;
    } else {
        const win32_arm64 = await import(
            "@lazy_engineer/tokenizers-huggingface-win32-arm64"
        );
        path = win32_arm64.path;
    }
} else if (os == "linux") {
    if (arch == "x64" || arch == "x86_64") {
        const linux_x64 = await import(
            "@lazy_engineer/tokenizers-huggingface-linux-x64"
        );
        path = linux_x64.path;
    } else {
        const linux_arm64 = await import(
            "@lazy_engineer/tokenizers-huggingface-linux-arm64"
        );
        path = linux_arm64.path;
    }
} else {
    if (arch == "x64" || arch == "x86_64") {
        const darwin_x64 = await import(
            "@lazy_engineer/tokenizers-huggingface-darwin-x64"
        );
        path = darwin_x64.path;
    } else {
        const darwin_arm64 = await import(
            "@lazy_engineer/tokenizers-huggingface-darwin-arm64"
        );
        path = darwin_arm64.path;
    }
}
export { path };