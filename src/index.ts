import events from 'events';
import fs from 'fs';
import * as readline from 'readline';

class Test {

    private static ErrorHandler( err : unknown){
        if(err instanceof Error) 
            return console.error(err);

        console.error(`Error : ${err}`);
    }

    static async FileWordAnalyzer(filename : String, word : string){
        
        try {

            if(!filename || !word) throw 'Todos los inputs son obligatorios'

            const path = __dirname + `/${filename}.txt`;
            const arr : string[] = [];

            const file = readline.createInterface({
                input : fs.createReadStream(path),
                crlfDelay : Infinity
            })

            file.on('line', (line) => {   
                const lineAux = 
                    line
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^\w\s]/gi, '')
                        
                arr.push(lineAux);
            })

            await events.once(file, 'close');
            
            let count = 0;

            for (let i = 0; i < arr.length; i++) {
                const subArr = arr[i].split(" ");
                for (let j = 0; j < subArr.length; j++){
                  if(subArr[j].includes(word) && word.length === subArr[j].length){
                    count += 1; 
                    console.log(`${arr[i]} - linea ${i + 1}`);
                  }       
               }
            }

            console.log("\n################################################");
            console.log(`La palabra : ${word} se encontro ${count} veces`);
            console.log("################################################");

            const input = readline.createInterface({
                input : process.stdin,
                output : process.stdout
            });
    
            const question = await new Promise((resolve) => {
                input.question('¿Quieres buscar otra palabra ?(Y/N)\n', (value) => {
                    resolve(value);
                })
            }) as string;
            
            if(question.trim().toLowerCase() === "y"){

                const newWord = await new Promise((resolve) => {
                    input.question('Escribe una nueva palabra para buscar ==> ', (value) => {
                        resolve(value);
                        input.close();
                    })
                }) as string;
                this.FileWordAnalyzer(filename, newWord.trim().toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/gi, ''));
            }
            console.log("\nPrograma finalizado");
            input.close();
        } catch (error) {
            this.ErrorHandler(error);
        }
    }
}

(
    async function(){
        const input = readline.createInterface({
            input : process.stdin,
            output : process.stdout
        });

        const filename = await new Promise((resolve) => {
            input.question('Escribe el nombre del archivo ==> ', (value) => {
                resolve(value);
                input.close();
            })
        }) as string;

        const input2 = readline.createInterface({
            input : process.stdin,
            output : process.stdout
        });

        const word = await new Promise((resolve) => {
            input2.question('Escribe la palabra a buscar ==> ', (value) => {
                resolve(value);
                input2.close();
            })
        }) as string;

        Test.FileWordAnalyzer(filename, word.toLowerCase().trim().replace(/[\u0300-\u036f]/g, ""));
    }
)()