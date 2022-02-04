import { ArgumentParser } from "argparse";
import fs from "fs";

async function main() {
    const parser = new ArgumentParser({
        description: "Some example, read file",
    });

    parser.add_argument("-f", "--input-file", {
        required: true,
        help: "Input file",
        metavar: "PATH",
    });

    try {
        const args = parser.parse_args();
        const contents = fs.readFileSync(args.input_file, "utf8");
        console.log(contents);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
