// Modal

var aActive = document.querySelector("#new-transation")
var aCancelModal = document.querySelector('.cancel');
var modal = document.querySelector(".modal-overlay");
var buttonAtualiza = document.querySelector("#atualizacao");
var buttonSave = document.querySelector('#salvar');


aActive.addEventListener("click", ()=>{
    modal.classList.add('active');

    buttonAtualiza.classList.add('hidden');
    buttonSave.disabled = false;
    buttonSave.style.display = 'initial';
    
})



aCancelModal.addEventListener("click", ()=>{
    modal.classList.remove('active');
})

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem('transactions')) || [];       //transforma a string em array ou objeto
    },
    set(transactions){
        localStorage.setItem('transactions', JSON.stringify(transactions)); //transforma o array em string
    }
}

// Eu preciso somar as entradas
var Transaction = {
    all: Storage.get(),

    add(transactions){
        Transaction.all.push(transactions)

        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)
        App.reload();
    },

    incomes(){
        let income = 0
        // pegar todas as transações
         // para cada transação
        Transaction.all.forEach(transactions =>{
            // se ela for  maior que zero
            if(transactions.amount > 0 ){
                // somar a uma variavel e retornar a variavel

                income += transactions.amount;
            }
        })
       
        return income;
    },

   
    expenses(){
        let expense = 0
        // pegar todas as transações
         // para cada transação
        Transaction.all.forEach(transactions =>{
            // se ela for  menor que zero
            if(transactions.amount < 0 ){
                // somar a uma variavel e retornar a variavel

                expense += transactions.amount;
            }
        })
        return expense;
    },

    total(){
        return Transaction.incomes() + Transaction.expenses()
    },
}


// Substituir os dados do HTML com os dados do JS
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    
    addTransaction(transactions, index){
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transactions, index);

        tr.dataset.index = index;

        
        
        
        tr.addEventListener('click', ()=>{
            var getIndex = event.target.parentNode.dataset.index;
            var DescriptionValues = Transaction.all[getIndex].description;
            var AmountValues = Transaction.all[getIndex].amount;
            var InputDescription = document.querySelector("#description");
            var InputAmount = document.querySelector('#amount');
            var InputDate = document.querySelector("date");
           
            modal.classList.add('active');
           
            InputDescription.value = DescriptionValues;
            InputAmount.value = (AmountValues / 100);

            console.log(getIndex);
          
            buttonAtualiza.classList.remove('hidden');
            buttonSave.disabled = true;

            buttonSave.style.display = 'none';
            buttonAtualiza.addEventListener('click', ()=>{
                event.preventDefault();
                console.log(getIndex);
            })

        }),



        

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transactions, index){
        const CSSclass = transactions.amount > 0 ? 'income' : 'expense'

        const amount = Utils.formatCurrency(transactions.amount);

        const html = 
        `
            <td class="description">${transactions.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transactions.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./public/assets/minus.svg" alt="Remover Transação">
            </td>

        `
        return html
    }, 

    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Utils = {
    formatAmount(value){   
        // value = value.replace(/\,?\.?/g, "");
        
        value = Number(value) * 100;

        return Math.round(value)
    },

    formatDate(date){
        const splitedDate = date.split('-');
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`;
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? '-' : '';

        value = String(value).replace(/\D/g, '');

        value = Number(value) / 100

        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return{
            description: Form.description.value, 
            amount: Form.amount.value, 
            date: Form.date.value
        }
    },
    
    formatValues(){
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return {
            description,
            amount, 
            date
        }
    },

    validateField(){
        const { description, amount, date } = Form.getValues();

        if(description.trim() === '' || amount.trim() === '' || date.trim() === ''){
            throw new Error("Por favor preencha todos os campos");
        }
    },

    saveTransaction(transactions){
        Transaction.add(transactions)
    },

    clearFields(){
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event){
        event.preventDefault();

        try{
            Form.validateField();
            // verificar se todas as informações foram preenchidas
            // formatar os dados para salvar
            const transactions = Form.formatValues();
            Transaction.add(transactions);
            // salvar
            // Form.saveTransaction();
            // apagar os dados do formulário
            Form.clearFields();
            // modal feche
            modal.classList.remove('active');
          
        } catch(error){
            alert(error.message);
        }
    }
}



const App = {
    init(){

        Transaction.all.forEach((transactions, index) =>{
            DOM.addTransaction(transactions, index);
        });
        
        DOM.updateBalance();

        Storage.set(Transaction.all)

    },
    reload(){
        DOM.clearTransactions();
        App.init();
    },
}

App.init()




