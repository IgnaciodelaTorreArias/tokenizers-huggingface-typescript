const isDeno = typeof Deno !== "undefined" && typeof Deno.version !== "undefined";
const isBun = typeof Bun !== "undefined" && typeof Bun.version !== "undefined";
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

if (isDeno) {
    await Deno.mkdir("./src/generated", {recursive: true});
    await Deno.chmod("./scripts/generate.deno.sh", 755);
    let command: Deno.Command
    if (os == "windows" || os == "win32"){
        command = new Deno.Command("cmd", {
            args: ["/c", "cd scripts && protoc --plugin=protoc-gen-ts_proto=generate.deno.cmd --ts_proto_out=../src/generated --ts_proto_opt=noDefaultsForOptionals=true,importSuffix=.ts --proto_path=../tokenizers_proto/protos ../tokenizers_proto/protos/lib.proto"],
        })
    } else {
        command = new Deno.Command("sh", {
            args: ["-c", "cd scripts && protoc --plugin=protoc-gen-ts_proto=./generate.deno.sh --ts_proto_out=../src/generated --ts_proto_opt=noDefaultsForOptionals=true,importSuffix=.ts --proto_path=../tokenizers_proto/protos ../tokenizers_proto/protos/lib.proto"],
        })
    }
    await command.output();
}
if (isBun) {
    const fs = await import("node:fs/promises");
    await fs.chmod("./scripts/generate.bun.sh", 755)
    await fs.mkdir("./src/generated", {recursive: true})
    const mod = await import("bun")
    if (os == "windows" || os == "win32"){
        await mod.$`cd scripts && protoc --plugin=protoc-gen-ts_proto=generate.bun.cmd --ts_proto_out=../src/generated --ts_proto_opt=noDefaultsForOptionals=true,importSuffix=.ts --proto_path=../tokenizers_proto/protos ../tokenizers_proto/protos/lib.proto`;
    } else {
        await mod.$`cd scripts && protoc --plugin=protoc-gen-ts_proto=./generate.bun.sh --ts_proto_out=../src/generated --ts_proto_opt=noDefaultsForOptionals=true,importSuffix=.ts --proto_path=../tokenizers_proto/protos ../tokenizers_proto/protos/lib.proto`;
    }
}