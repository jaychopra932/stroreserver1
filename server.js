let express=require("express")
let app=express()
app.use(express.json())
app.use(function(req,res,next){
    res.header ("Access-Control-Allow-Origin","*")
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
    )
    res.header (
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
        )
next();
})
var port=process.env.PORT||2410
app.listen(port,() =>console. log(`Node App listening on port ${port}!`))
let {shops,products,purchases}=require("./data.js")
let fs=require("fs")
let readLine=require("readline-sync")
let shopFile="shops.json"
let productsFile="products.json"
let purchasesFile="purchases.json"

function serverOn(){
    let data1=JSON.stringify(shops)
    let data2=JSON.stringify(purchases)
    let data3=JSON.stringify(products)
    fs.writeFile(shopFile,data1,function(err){
        if(err) console.log(err)
    })
    fs.writeFile(purchasesFile,data2,function(err){
        if(err) console.log(err)
    })
    fs.writeFile(productsFile,data3,function(err){
        if(err) console.log(err)
    })
}
serverOn()

app.get("/shops",function(req,res){
    fs.readFile(shopFile,"utf-8",function(err,data){
        if(err) res.status(404).send(err)
        else {
            let obj =JSON.parse(data)
            res.send(obj)
        }
    })
    
})
app.get("/products",function(req,res){
    fs.readFile(productsFile,"utf-8",function(err,data){
        if(err) res.status(404).send(err)
        else {
            let obj =JSON.parse(data)
            res.send(obj)
        }
    })
    
})
app.get("/purchases",function(req,res){
    let {shop,product,sortBy}=req.query
    fs.readFile(purchasesFile,"utf-8",function(err,data){
        if(err) res.status(404).send(err)
        else {
            let obj =JSON.parse(data)
            let arr=[...obj]
            if(shop){
                arr=arr.filter((a)=>a.shopId==shop)
            }
            if(product){
                let productArr=product.split(",")
                arr=arr.filter((a)=>productArr.findIndex((b)=>a.productid==b)>=0)
            }
            if(sortBy=="QtyAsc"){
                arr=arr.sort((a,b)=>a.quantity-b.quantity)
            }
            if(sortBy=="QtyDesc"){
                arr=arr.sort((a,b)=>b.quantity-a.quantity)
            }
            if(sortBy=="ValueAsc"){
                arr=arr.sort((a,b)=>(a.quantity*a.price)-(b.quantity*b.price))
            }
            if(sortBy=="ValueDesc"){
                arr=arr.sort((a,b)=>(b.quantity*b.price)-(a.quantity*a.price))
            }
            res.send(arr)
        }
    })
    
})
app.get("/purchases/shops/:id",function(req,res){
    let id=req.params.id
    fs.readFile(purchasesFile,"utf-8",function(err,data){
        if(err) res.status(404).send(err)
        else {
            let obj =JSON.parse(data)
            arr=obj.filter((a)=>a.shopId==id)
            res.send(arr)
        }
    })
})
app.get("/purchases/products/:id",function(req,res){
    let id=req.params.id
    fs.readFile(purchasesFile,"utf-8",function(err,data){
        if(err) res.status(404).send(err)
        else {
            let obj =JSON.parse(data)
            arr=obj.filter((a)=>a.productid==id)
            res.send(arr)
        }
    })
})
app.get("/TotalPurchase/shops/:id",function(req,res){
    let id=req.params.id
    fs.readFile(purchasesFile,"utf-8",function(err,data){
        if(err) res.status(404).send(err)
        else {
            let purchaseArr =JSON.parse(data)
            fs.readFile(productsFile,"utf-8",function(err,data1){
                if(err) res.status(404).send(err)
                else {
                    let productArr =JSON.parse(data1)
                    let filteredArr=purchaseArr.filter((a)=>a.shopId==id)
                    let arr=productArr.map((a)=>{
                        let total=filteredArr.reduce((b,c)=>c.productid==a.productId?b+=c.quantity:b,0)
                        let json={...a,total:total}
                        return json
                    })
                    res.send(arr)
                }
            })
        }
    })
})
app.get("/TotalPurchase/products/:id",function(req,res){
    let id=req.params.id
    fs.readFile(purchasesFile,"utf-8",function(err,data){
        if(err) res.status(404).send(err)
        else {
            let purchaseArr =JSON.parse(data)
            fs.readFile(shopFile,"utf-8",function(err,data1){
                if(err) res.status(404).send(err)
                else {
                    let shopsArr =JSON.parse(data1)
                    let filteredArr=purchaseArr.filter((a)=>a.productid==id)
                    let arr=shopsArr.map((a)=>{
                        let total=filteredArr.reduce((b,c)=>c.shopId==a.shopId?b+=c.quantity:b,0)
                        let json={...a,total:total}
                        return json
                    })
                    res.send(arr)
                }
            })
        }
    })
})

app.post("/shops",function(req,res){
    let body=req.body
    fs.readFile(shopFile,"utf-8",function(err,data){
        if(err) res.status(404).send(err)
        else{
            let shopsArr=JSON.parse(data)
            let lastId=shopsArr.reduce((a,c)=>c.shopId>a?a=c.shopId:a,0)+1
            let json={shopId:lastId,...body}
            shopsArr.push(json)
            let data1=JSON.stringify(shopsArr)
            fs.writeFile(shopFile,data1,function(err){
                if(err) res.status(404).send(err)
                else res.send(body)
            })
        }
    })
})
app.post("/products",function(req,res){
    let body=req.body
    fs.readFile(productsFile,"utf-8",function(err,data){
        if(err) res.status(404).send(err)
        else{
            let productArr=JSON.parse(data)
            let lastId=productArr.reduce((a,c)=>c.productId>a?a=c.productId:a,0)+1
            let json={productId:lastId,...body}
            productArr.push(json)
            let data1=JSON.stringify(productArr)
            fs.writeFile(productsFile,data1,function(err){
                if(err) res.status(404).send(err)
                else res.send(body)
            })
        }
    })
})
app.post("/purchases",function(req,res){
    let body=req.body
    fs.readFile(purchasesFile,"utf-8",function(err,data){
        if(err) res.status(404).send(err)
        else{
            let purchaseArr=JSON.parse(data)
            let lastId=purchaseArr.reduce((a,c)=>c.purchaseId>a?a=c.purchaseId:a,0)+1
            let json={purchaseId:lastId,...body}
            purchaseArr.push(json)
            let data1=JSON.stringify(purchaseArr)
            fs.writeFile(purchasesFile,data1,function(err){
                if(err) res.status(404).send(err)
                else res.send(body)
            })
        }
    })
})
app.put("/products/:id",function(req,res){
    let id=req.params.id
    let body=req.body
    fs.readFile(productsFile,"utf-8",function(err,data){
        if(err) res.status(404).send(err)
        else{
            let productsArr=JSON.parse(data)
            let index=productsArr.findIndex((a)=>a.productId==id)
            if(index>=0){
                let updatedProduct={...productsArr[index],...body}
                productsArr[index]=updatedProduct
                let data1=JSON.stringify(productsArr)
                fs.writeFile(productsFile,data1,function(err){
                    if(err) res.status(404).send(err)
                    else res.send(updatedProduct)
                })
            }
            else{
                res.status(404).send("NO Customer FOUND")
            }
        }
    })
})