diaScript/
├── src/
│   ├── commandHandler.js      (Terminal komut işleyici - ANA)
│   ├── commands/              (Modüler komutlar)
│   │   ├── run.js            (dia st myfile.ds)
│   │   ├── help.js
│   │   ├── version.js
│   │   └── ...
│   ├── core/                  (Script dili motoru)
│   │   ├── tokenizer.js      (Yeni tokenizer)
│   │   ├── parser.js         (Yeni parser/syntax handler)
│   │   ├── interpreter.js
│   │   ├── nodes/            (AST node'ları)
│   │   └── utils.js
│   └── bin/
│       └── dia               (Linux/macOS executable)
├── dia.bat                   (Windows executable)
├── package.json
└── readme.md