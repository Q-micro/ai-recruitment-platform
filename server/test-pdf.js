//Utility script used during development to test PDF CV text extraction. Not required for production runtime.
import fs from "fs";
import { PDFParse } from "pdf-parse";

const dataBuffer = fs.readFileSync("cv_ali_sample.pdf");

const parser = new PDFParse({ data: dataBuffer });

const result = await parser.getText();


console.log("========== CV TEXT ==========\n");
console.log(result.text);
console.log("\n========== END ==========");