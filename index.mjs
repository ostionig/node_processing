import { clashList } from "./resource/clash.mjs";
import { v2rayList } from "./resource/v2ray.mjs";
import {
  generateClashConf,
  getClashFileByUrl,
  getClashNodesByContent,
  mergeClashNodes,
} from "./src/clash.mjs";
import { logger } from "./src/log.mjs";
import { getNodeFreeOrg } from "./src/nodefreeOrg.mjs";
import { generateFile } from "./src/output.mjs";
import { testSpeed } from "./src/speedTest.mjs";
import { batchV2rayToClashNodes } from "./src/v2ray.mjs";
import uuidValidate from 'uuid-validate';
import { to } from "await-to-js"
import pkg from 'lodash';
const { last } = pkg;
import jsYaml from "js-yaml";

async function task1() {
  const [nodeListErr, nodeList] = await to(mergeClashNodes(clashList));

  const [freeErr, freeNodeContent] = await to(getNodeFreeOrg(0, "yaml"));

  const freeNode = await getClashNodesByContent(
    freeNodeContent.replaceAll("!<str>", "")
  );

  const v2rayToClashNodes = await batchV2rayToClashNodes(v2rayList);

  let allNodes = [...nodeList, ...freeNode, ...v2rayToClashNodes];

  // for (let i = 0; i < allNodes.length; i++) {
  //   const proxy = allNodes[i];
  //   console.log(proxy);
  //   await testSpeed(proxy).then(rs => {
  //     console.log(rs);
  //   })
  // }

  let configContent;

  try {
    configContent = generateClashConf(
      allNodes
        .filter((node) => node)
        .filter((node) => !node.name.includes("中国"))
        .filter((node) => !String(node.password).includes("<"))
        // 过滤不支持的vless协议
        .filter((node) => node.type !== "vless")
        .filter((node) => !node.name.includes("🇨🇳 CN"))
        .filter((node) => !node.uuid || uuidValidate(node.uuid))
        .filter((node) => node.cipher !== "chacha20-poly1305")
    );

  } catch (error) {

  }

  const comments = `# 更新时间 ${new Date().toISOString()}
`;
  generateFile("clashMerge", comments + configContent);
}

task1();

function getFileName(url){
  const arr = url.split("/");
  let fileName = last(arr);

  if(fileName.includes(".yaml")){
    return fileName;
  }else{
    return fileName + ".yaml"
  }
}

// copy speednode and add custom rules
async function task2(){
  await Promise.all(clashList.map(async (url)=>{
    const config = await getClashFileByUrl(url);

    const fileName = getFileName(url);

    config.rules.unshift("DOMAIN-KEYWORD,local,DIRECT");
    
    const fileContent = jsYaml.dump(config);

    generateFile(fileName, fileContent);

    const configContent = generateClashConf(conf.proxies);

    const comments = `# 更新时间 ${new Date().toISOString()}
`;
    generateFile("copy_"+fileName, comments + configContent);
  }))

  
}

task2();
