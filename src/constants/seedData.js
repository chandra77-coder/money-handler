export const SEED_ACCOUNTS = [];
export const SEED_TX = [];
export const SEED_LOANS = [];
export const SEED_UPI = [];
export const SEED_PROFILE = { name:"", avatar:null, occupation:"Salaried", monthlyIncome:"", language:"English", dateFormat:"DD/MM/YYYY", theme:"system" };

export const SEED_CATEGORIES = {
  income:  [{l:"Salary",icon:"💼"},{l:"Freelance",icon:"💻"},{l:"Business",icon:"🏪"},{l:"Gift",icon:"🎁"},{l:"Other",icon:"💰"}],
  expense: [{l:"Food",icon:"🍛"},{l:"Travel",icon:"🚌"},{l:"Bills",icon:"📄"},{l:"Shopping",icon:"🛍️"},{l:"Health",icon:"💊"},{l:"Other",icon:"📦"}],
};

export const OCCUPATIONS = ["Salaried","Business","Freelance","Student","Other"];
export const LANGUAGES = ["English","Bengali"];
export const DATE_FORMATS = ["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"];

export const SEED_WORK_NAMES = ["PAN Card", "Aadhar Card", "Passport"];
export const SEED_WORK_RECORDS = [];

export const INCOME_METHODS  = ["Cash","Online / UPI","Bank Transfer","Cheque"];
export const EXPENSE_METHODS = ["Cash","UPI / Online","Card","Bank Transfer"];
export const ACCOUNT_TYPES   = [{type:"Cash",icon:"💵"},{type:"Bank",icon:"🏦"},{type:"Wallet",icon:"📱"},{type:"Other",icon:"💰"}];
