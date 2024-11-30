var fs = require("fs");
var path = require("path");
var typescript = require("typescript");

function typescriptTransform(options) {
  options = options || {};
  if (!options.extensions) {
    options.extensions = [".tsx"];
  }

  return function transform(file, enc, done) {
    const extension = path.extname(file.path);
    const parser = this.parser;
    let content = fs.readFileSync(file.path, enc);

    if (options.extensions.indexOf(extension) !== -1) {
      content = typescript.transpileModule(content, {
        compilerOptions: {
          target: 'es2018'
        },
        fileName: path.basename(file.path)
      }).outputText;
      parser.parseTransFromString(content);
      parser.parseFuncFromString(content);
    }
    done();
  };
};

module.exports = {
  input: [
    'src/**/*.{ts,tsx}', // 扫描 TS 和 TSX 文件
  ],
  options: {
    debug: true, // 打开调试信息
    defaultLng: 'zh-CN', // 默认语言
    func: {
      list: ['t', 'i18next.t', 'i18n.t'],
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    trans: {
      component: 'Trans',
      extensions: ['.js', '.jsx'],
    },
    transform: typescriptTransform({ extensions: ['.ts', '.tsx'] }),
    lngs: ['en-US', 'zh-CN', 'zh-TW'], // 支持的语言
    ns: ['translation'], // 默认命名空间
    keySeparator: '.', // 翻译键的分隔符
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
    removeUnusedKeys: true, // 删除未使用的键
    resource: {
      loadPath: 'src/locales/{{lng}}/{{ns}}.json', // 翻译文件存储路径
      savePath: 'src/locales/{{lng}}/{{ns}}.json', // 保存路径
    },
    postProcess: ['zh-CN'],
  },
};