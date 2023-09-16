const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const JsonFileAdapter = require('@bot-whatsapp/database/json')

const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(['📄 Aquí tenemos el flujo secundario']);
const menun = [];
const deudatotal = [];
let ci;
let nombre;
let dir;
let pedido;
let telefono;

const flowPedido = addKeyword('434589').addAnswer('Que Deseas ?  Indica tu pedido en un solo mensaje indicando los productos y sus cantidades', {
    capture: true,
}, 
    async (ctx, { flowDynamic, state, gotoFlow }) => {
        console.log(ctx);
        nombre=ctx.pushName;
        telefono=ctx.from;
        pedido=ctx.body;
        flowDynamic(`*Resumen de Pedido*\nNombre: ${nombre}\nTelefono: ${telefono}\nPedido: ${pedido}`)
    }).addAnswer('Es Correcto ?', { capture: true, },
        async (ctx, { flowDynamic, endFlow }) => {
            if (ctx.body.toUpperCase() == 'SI') {
                //console.log('Indicame la Direccion:')


            } else {
                endFlow({ body: 'Pedido Cancelado, si desea ordenar nuevamente escriba *Menu* ' })
            }

        }



    ).addAnswer('Me puede indicar la direccion?', { capture: true, },
        async (ctx, { flowDynamic, state }) => {
            dir=ctx.body;
            //miState = state.update({ dir: ctx.body });
            //dire = state.getMyState();
            //console.log(dire.dir);
            flowDynamic(`Perfecto, su pedido ha sido Procesado...
            *Resumen de Pedido*\nNombre: ${nombre}\nTelefono: ${telefono}\nPedido: ${pedido}\nDireccion: ${dir}
            \nEl Delivery si comunicara con usted 
            `)
        }
    )

const flowDocs = addKeyword(['menu', 'comida', 'comer', 'menú']).addAnswer('Menu',
    //    menun.push('Tequenos 6$'),menun.push('SCervezas 1$'),console.log(menun)
    //).addAnswer(menun

    { media: 'menu2.png' }

).addAnswer('Deseas pedir algo *Si* o *No*?', {
    capture: true,
},
    async (ctx, { flowDynamic, gotoFlow,endFlow }) => {
        if (ctx['body'].toUpperCase() == 'SI') {

            await gotoFlow(flowPedido)
        }else{
            endFlow({body:'Vale estamos a la orden, si te decides por algo puedes escribir *menu* en cualquier momento, Gracias..'})
        }

    }



)


const flowVerc = addKeyword(['ver categorias', 'verc']).addAnswer('Estas son las categorías disponibles:', null, async (ctx, { flowDynamic }) => {
    await flowDynamic('Enviar un mensaje text')
    console.log(ctx)

    const listaDeArticulos = [
        {
            name: 'Item 1'
        },
        {
            name: 'Item 2'
        },
        {
            name: 'Item 3'
        }
    ]

    const mapeoDeLista = listaDeArticulos.map((item) => item.name).join(', ') //Item 1, Item 2, Item 3

    await flowDynamic(mapeoDeLista)



    // Enviar una imagen o pdf o etc


})



const flowDeuda = addKeyword(['deuda', 'saldo']).addAnswer(
    '¿Cual es tu cedula?',
    {
        capture: true,
    },
    async (ctx, { flowDynamic, state }) => {
        state.update({ cedula: ctx.body })
        flowDynamic('Gracias, ')
    }
).addAnswer('consultando',
    null,
    async (ctx, { flowDynamic, state }) => {
        const XLSX = require('xlsx')

        const worbook = XLSX.readFile('datos.xlsx');
        const worbookSheets = worbook.SheetNames;
        const sheet = worbookSheets[0];
        const dataExcel = XLSX.utils.sheet_to_json(worbook.Sheets[sheet]);
        micedula = state.getMyState()
        //micedula=String(micedula)
        console.log(micedula['cedula']);
        deudatotal.push(dataExcel);

        for (const itemFila of dataExcel) {
            console.log(itemFila['nombre'])
            if (itemFila['cedula'] == micedula['cedula']) {
                console.log(itemFila['nombre'])

                ci = [itemFila['nombre']];

                deudaf = 'sr : ' + String(ci) + ' ' + itemFila['deuda']
                console.log(deudaf);
                return await flowDynamic([deudaf])

            }

        }
        //console.log(dataExcel[0]['cedula']);

    }





)//.addAnswer(ci)














const flowPrincipal = addKeyword(['hola'])
    .addAnswer('🙌 Hola bienvenido a este *Mi Chatbot*')
    .addAnswer(
        ['Respondemos de forma automatizada ',
            'Puedes Utilizar Los Siguientes comandos:',
            '👉 *menu* para ver menu',
            //'Escribe *deuda* para ver tu saldo'
        ],
        null,
        null,
        [flowDocs], [flowDeuda]
    )

const main = async () => {
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowPrincipal, flowDocs, flowDeuda, flowVerc, flowPedido])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
