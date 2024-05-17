import sharp from 'sharp';
import { readdir, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

// Parse command-line arguments
const args = process.argv.slice(2);

// Check if there are enough arguments
if (args.length === 0) {
    console.log("Not enough arguments, try -h or --help");
    process.exit();
}

let srcDir, desDir;

// Iterate through command-line arguments
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-s' || arg === '--source-dir') {
        srcDir = args[i + 1];
        i++;
    } else if (arg === '-d' || arg === '--destin-dir') {
        desDir = args[i + 1];
        i++;
    } else if (arg === '-h' || arg === '--help') {
        console.log('img-optimise: Optimizes images for web deployment. Supports various formats like JPG/JPEG, PNG, and WebP');
        console.log("");
        console.log("Usage: node index [options] <dir>");
        console.log("");
        console.log("Options:");
        console.log("");
        console.log("  -h, --help           Display help information");
        console.log("  -s, --source-dir     Source directory");
        console.log("  -d, --destin-dir     Destination directory");
        console.log("");
        console.log("Examples:");
        console.log("");
        console.log("  node index -s imgs -d img_opti   # Optimize images from \"imgs\" to \"imgs_opti\" directory");
        console.log("  node index -s imgs   # Optimize images from \"images\" to new \"imgs_optimised\" directory");
        process.exit()
    } else {
        console.error(`Invalid argument: ${arg}`);
        console.log("Try -h or --help");
        process.exit()
    }
}

// Check if source directory is provided
if (!srcDir) {
    console.log("Provide source directory!");
    console.log("Try -h or --help");
    process.exit()
}

// Check if destination directory is provided, if not, create one
if (!desDir) {
    try {
        await mkdir(`${srcDir}_optimised`);
        desDir = `${srcDir}_optimised`;
    } catch (err) {
        if (err.code === 'EEXIST') {
            console.log(`Directory already exists: ${srcDir}_optimised`);
            console.log("Try after deleting it!");
            process.exit();
        } else {
            console.error('Error creating directory:', err.message);
        }
    }
}

// Compressing images with its corresponding file formats 
try {
    const files = await readdir(srcDir);
    for (const file of files) {
        const filePath = path.join(srcDir, file);
        const stats = await stat(filePath);

        if (stats.isFile()) {
            const extname = path.extname(file);
            switch (extname) {
                case ".jpeg":
                case ".jpg":
                    sharp(filePath)
                        .jpeg()
                        .toFile(`${desDir}/${file}`, (err, info) => {
                            if (err) {
                                console.error(err);
                            } 
                        });
                    break;
                case ".webp":
                    sharp(filePath)
                        .webp()
                        .toFile(`${desDir}/${file}`, (err, info) => {
                            if (err) {
                                console.error(err);
                            } 
                        });
                    break;
                case ".png":
                    sharp(filePath)
                        .png({ quality: 80 })
                        .toFile(`${desDir}/${file}`, (err, info) => {
                            if (err) {
                                console.error(err);
                            }
                        });
                    break;
                default:
                    console.log(extname + " format not supported!");
                    break;
            }
        }
    }
} catch (err) {
    console.error(err);
}