import { writeFile } from "fs";
import { logger } from "./log.mjs"

export function generateFile(fileName, content) {
    const name = fileName.includes(".yaml")?fileName:(fileName+".yaml")

    writeFile(`./dist/${name}`, content, function (info) {
        logger.info("writeFile - info", info);
    });
}