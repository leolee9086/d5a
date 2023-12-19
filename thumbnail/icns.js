const fs = require('fs'); // 引入文件系统模块
const imageSize = require('./../js/image-size.js'); // 引入图片尺寸模块
const AdmZip = require('adm-zip'); // 引入zip文件处理模块

/**
 * 提取并获取.d5a文件中的icon.png图标的尺寸信息
 * @param {Object} param0 - 输入参数
 * @param {string} param0.src - .d5a文件的源路径
 * @param {string} param0.dest - icon.png的目标路径
 * @param {Object} param0.item - 需要更新的项目对象
 * @returns {Promise<Object>} 返回一个Promise，解析后的值为更新后的项目对象
 */
module.exports = async ({ src, dest, item }) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. 解压.d5a文件
            let zip = new AdmZip(src);
            let zipEntries = zip.getEntries();

            // 2. 找到icon.png文件
            let iconEntry = zipEntries.find(entry => entry.entryName === 'icon.png');
            if (!iconEntry) {
                return reject(new Error(`icon.png not found in .d5a file.`));
            }

            // 3. 将icon.png文件提取到目标路径
            let iconData = iconEntry.getData();
            fs.writeFileSync(dest, iconData);

            // 4. 获取icon.png文件的尺寸
            let size = await imageSize(dest);

            // 5. 检查结果是否正确
            if (!fs.existsSync(dest) || size.width === 0) {
                return reject(new Error(`icon.png file thumbnail generate fail.`));
            }

            // 6. 更新项目的尺寸信息
            item.height = size?.height || item.height;
            item.width = size?.width || item.width;

            // 7. 返回结果
            return resolve(item);
        }
        catch (err) {
            return reject(err);
        }
    });
}