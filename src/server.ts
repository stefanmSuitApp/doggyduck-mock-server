import cors from 'cors';
import express from 'express';

import { banks } from '../db/banks';
import { bills } from '../db/bills';
import { calculations } from '../db/calculations';
import { clients } from '../db/clients';
import { compensationDocuments } from '../db/compensation-documents';
import { compensations } from '../db/compensations';
import { containers } from '../db/containers';
import { employeeExpenses } from '../db/employeeExpenses';
import { employees } from '../db/employees';
import { equipments } from '../db/equipments';
import { expenses } from '../db/expenses';
import { financeDesk } from '../db/financeDesk';
import { fuelPricings } from '../db/fuelPricings';
import { fuels } from '../db/fuels';
import { invoices } from '../db/invoices';
import { meInfo } from '../db/meInfo';
import { nisPrices } from '../db/nisPrices';
import { partners } from '../db/partners';
import { payments } from '../db/payments';
import { statements } from '../db/statements';
import { stimulations } from '../db/stimulations';
import { suppliers } from '../db/suppliers';
import { suspensions } from '../db/suspensions';
import { tours } from '../db/tours';
import { users } from '../db/users';

interface PaginationMeta {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

interface QueryParams {
  Filter?: string;
  ItemsPerPage?: string | number;
  SortField?: string;
  SortDirection?: string;
  Page?: string | number;
}

export function paginateFilterSort<T>(
  items: T[],
  query: QueryParams,
  filterField: keyof T
): PaginatedResult<T> {
  const filter = typeof query.Filter === 'string' ? query.Filter : '';
  const itemsPerPage = Number(query.ItemsPerPage) || 10;
  const sortField = (query.SortField as keyof T) || filterField;
  const rawDirection = typeof query.SortDirection === 'string' ? query.SortDirection : 'asc';
  const sortDirection = rawDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  const page = Number(query.Page) || 1;

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const filtered = filter
    ? items.filter((item) => String(item[filterField]).toLowerCase().includes(filter.toLowerCase()))
    : items;

  const sorted = filtered.sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined || bValue === undefined) return 0;

    if (aValue == null || bValue == null) return 0;
    if (aValue < bValue) return sortDirection === 'ASC' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'ASC' ? 1 : -1;
    return 0;
  });

  const paginated = sorted.slice(startIndex, endIndex);

  return {
    items: paginated,
    meta: {
      totalItems: filtered.length,
      itemsPerPage,
      currentPage: page,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    },
  };
}

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/auth/login', (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.username === email && u.password === password);
  if (user) {
    res.json({
      jwtToken: '12345',
      refreshToken: '11224432',
    });
  } else {
    res.status(400).json({ message: 'Invalid credentials.' });
  }
});

app.get('/api/nis-prices', (req: express.Request, res: express.Response) => {
  res.json(nisPrices);
});

app.get('/api/user/me', (req: express.Request, res: express.Response) => {
  res.json(meInfo);
});

app.get('/api/banks/banks-list', (req: express.Request, res: express.Response) => {
  if (banks.items.length === 0) {
    res.status(404).json({ message: 'No banks found.' });
    return;
  }

  const result = paginateFilterSort(banks.items, req.query, 'name');

  res.json(result);
});

app.put('/api/banks/update-bank', (req: express.Request, res: express.Response) => {
  const { id, abbreviation, account, name, address, isActive } = req.body;
  const bankIndex = banks.items.findIndex((b) => b.id === id);
  if (bankIndex !== -1) {
    banks.items[bankIndex] = {
      ...banks.items[bankIndex],
      abbreviation,
      account,
      name,
      address,
      isActive,
    };
    res.json(banks.items[bankIndex]);
  } else {
    res.status(404).json({ message: 'Bank not found.' });
  }
});

app.get('/api/banks/:bankId', (req: express.Request, res: express.Response) => {
  const bankId = req.params.bankId;
  const bank = banks.items.find((b) => b.id === bankId);
  if (bank) {
    res.json(bank);
  } else {
    res.status(404).json({ message: 'Bank not found.' });
  }
});

app.post('/api/banks/create-bank', (req: express.Request, res: express.Response) => {
  const { code, abbreviation, account, name, address, isActive } = req.body;
  const newBank = {
    id: String(banks.items.length + 1),
    no: banks.items.length + 1,
    code,
    abbreviation,
    account,
    name,
    address,
    isActive,
  };
  banks.items.push(newBank);
  res.status(201).json(newBank);
});

app.get('/api/clients/clients-list', (req: express.Request, res: express.Response) => {
  if (clients.items.length === 0) {
    res.status(404).json({ message: 'No clients found.' });
    return;
  }

  const result = paginateFilterSort(clients.items, req.query, 'name');

  res.json(result);
});

app.get('/api/clients/:clientId', (req: express.Request, res: express.Response) => {
  const clientId = req.params.clientId;
  const client = clients.items.find((b) => b.id === clientId);
  if (client) {
    res.json(client);
  } else {
    res.status(404).json({ message: 'Client not found.' });
  }
});

app.post('/api/clients/create-client', (req: express.Request, res: express.Response) => {
  const { pib, mb, name, shortName, bankAccount, address, ptt, city, state, currency, clientType } =
    req.body;
  const newClient = {
    id: String(clients.items.length + 1),
    no: clients.items.length + 1,
    pib,
    mb,
    name,
    shortName,
    bankAccount,
    address,
    ptt,
    city,
    state,
    currency,
    clientType,
  };
  clients.items.push(newClient);
  res.status(201).json(newClient);
});

app.put('/api/clients/update-client', (req: express.Request, res: express.Response) => {
  const {
    id,
    pib,
    mb,
    name,
    shortName,
    bankAccount,
    address,
    ptt,
    city,
    state,
    currency,
    clientType,
  } = req.body;
  const clientIndex = clients.items.findIndex((b) => b.id === id);
  if (clientIndex !== -1) {
    clients.items[clientIndex] = {
      ...clients.items[clientIndex],
      pib,
      mb,
      name,
      shortName,
      bankAccount,
      address,
      ptt,
      city,
      state,
      currency,
      clientType,
    };
    res.json(clients.items[clientIndex]);
  } else {
    res.status(404).json({ message: 'Client not found.' });
  }
});

app.get('/api/suppliers/suppliers-list', (req: express.Request, res: express.Response) => {
  if (suppliers.items.length === 0) {
    res.status(404).json({ message: 'No suppliers found.' });
    return;
  }

  const result = paginateFilterSort(suppliers.items, req.query, 'name');

  res.json(result);
});

app.get('/api/suppliers/:supplierId', (req: express.Request, res: express.Response) => {
  const supplierId = req.params.supplierId;
  const supplier = suppliers.items.find((b) => b.id === supplierId);
  if (supplier) {
    res.json(supplier);
  } else {
    res.status(404).json({ message: 'Supplier not found.' });
  }
});

app.post('/api/suppliers/create-supplier', (req: express.Request, res: express.Response) => {
  const {
    email,
    phoneNumber,
    companyAccounts,
    pib,
    municipality,
    name,
    address,
    ptt,
    city,
    state,
    shortName,
    supplierType,
  } = req.body;
  const newSupplier = {
    id: String(suppliers.items.length + 1),
    no: suppliers.items.length + 1,
    address,
    city,
    companyAccounts,
    email,
    phoneNumber,
    municipality,
    name,
    pib,
    ptt,
    shortName,
    state,
    supplierType,
  };
  suppliers.items.push(newSupplier);
  res.status(201).json(newSupplier);
});

app.put('/api/suppliers/update-supplier', (req: express.Request, res: express.Response) => {
  const {
    id,
    email,
    phoneNumber,
    companyAccounts,
    pib,
    municipality,
    name,
    address,
    ptt,
    city,
    state,
    shortName,
    supplierType,
  } = req.body;
  const supplierIndex = suppliers.items.findIndex((b) => b.id === id);
  if (supplierIndex !== -1) {
    suppliers.items[supplierIndex] = {
      ...suppliers.items[supplierIndex],
      address,
      city,
      companyAccounts,
      email,
      phoneNumber,
      municipality,
      name,
      pib,
      ptt,
      shortName,
      state,
      supplierType,
    };
    res.json(suppliers.items[supplierIndex]);
  } else {
    res.status(404).json({ message: 'Supplier not found.' });
  }
});

app.get('/api/employees/employees-list', (req: express.Request, res: express.Response) => {
  if (employees.items.length === 0) {
    res.status(404).json({ message: 'No employees found.' });
    return;
  }

  const result = paginateFilterSort(employees.items, req.query, 'firstName');

  res.json(result);
});

app.get('/api/employees/:employeeId', (req: express.Request, res: express.Response) => {
  const employeeId = req.params.employeeId;
  const employee = employees.items.find((b) => b.id === employeeId);
  if (employee) {
    res.json(employee);
  } else {
    res.status(404).json({ message: 'Employee not found.' });
  }
});

app.post('/api/employees/create-employee', (req: express.Request, res: express.Response) => {
  const {
    firstName,
    lastName,
    position,
    nickname,
    dateOfBirth,
    idCardNumber,
    nationalId,
    address,
    domesticTourPercentage,
    internationalTourPercentage,
    salary,
    salaryAccount,
    fuel,
    religiousHoliday,
    isActiveEmployee,
    isActiveForPayroll,
    gender,
    email,
    isPartner,
    employeeRole,
  } = req.body;

  const newEmployee = {
    id: String(employees.items.length + 1),
    no: employees.items.length + 1,
    firstName,
    lastName,
    position,
    nickname,
    dateOfBirth,
    idCardNumber,
    nationalId,
    address,
    domesticTourPercentage,
    internationalTourPercentage,
    salary,
    salaryAccount,
    fuel,
    religiousHoliday,
    isActiveEmployee,
    isActiveForPayroll,
    gender,
    email,
    isPartner,
    employeeRole,
  };
  employees.items.push(newEmployee);
  res.status(201).json(newEmployee);
});

app.put('/api/employees/update-employee', (req: express.Request, res: express.Response) => {
  const {
    id,
    firstName,
    lastName,
    nickname,
    dateOfBirth,
    idCardNumber,
    nationalId,
    address,
    domesticTourPercentage,
    internationalTourPercentage,
    salary,
    salaryAccount,
    fuel,
    religiousHoliday,
    isActiveEmployee,
    isActiveForPayroll,
    gender,
    email,
    isPartner,
    employeeRole,
  } = req.body;
  const employeeIndex = employees.items.findIndex((b) => b.id === id);
  if (employeeIndex !== -1) {
    employees.items[employeeIndex] = {
      ...employees.items[employeeIndex],
      firstName,
      lastName,
      nickname,
      dateOfBirth,
      idCardNumber,
      nationalId,
      address,
      domesticTourPercentage,
      internationalTourPercentage,
      salary,
      salaryAccount,
      fuel,
      religiousHoliday,
      isActiveEmployee,
      isActiveForPayroll,
      gender,
      email,
      isPartner,
      employeeRole,
    };
    res.json(employees.items[employeeIndex]);
  } else {
    res.status(404).json({ message: 'Employee not found.' });
  }
});

app.get('/api/partners/partners-list', (req: express.Request, res: express.Response) => {
  if (partners.items.length === 0) {
    res.status(404).json({ message: 'No partners found.' });
    return;
  }

  const result = paginateFilterSort(partners.items, req.query, 'name');
  res.json(result);
});

app.get('/api/partners/:partnerId', (req: express.Request, res: express.Response) => {
  const partnerId = req.params.partnerId;
  const partner = partners.items.find((b) => b.id === partnerId);
  if (partner) {
    res.json(partner);
  } else {
    res.status(404).json({ message: 'Employee not found.' });
  }
});

app.post('/api/partners/create-partner', (req: express.Request, res: express.Response) => {
  const { name, shortName, discount, fuelMargin } = req.body;
  const newPartner = {
    id: String(partners.items.length + 1),
    no: partners.items.length + 1,
    name,
    shortName,
    discount,
    fuelMargin,
  };
  partners.items.push(newPartner);
  res.status(201).json(newPartner);
});

app.put('/api/partners/update-partner', (req: express.Request, res: express.Response) => {
  const { id, name, shortName, discount, fuelMargin } = req.body;
  const partnerIndex = partners.items.findIndex((b) => b.id === id);
  if (partnerIndex !== -1) {
    partners.items[partnerIndex] = {
      ...partners.items[partnerIndex],
      name,
      shortName,
      discount,
      fuelMargin,
    };
    res.json(partners.items[partnerIndex]);
  } else {
    res.status(404).json({ message: 'Partner not found.' });
  }
});

app.get('/api/tours/tours-list', (req: express.Request, res: express.Response) => {
  if (tours.items.length === 0) {
    res.status(404).json({ message: 'No tours found.' });
    return;
  }

  const result = paginateFilterSort(tours.items, req.query, 'tours');

  res.json(result);
});

app.get('/api/tours/get-by-id', (req: express.Request, res: express.Response) => {
  const tourId = req.query.id as string;
  const tour = tours.items[0].tours.find((t) => t.id === tourId);
  if (tour) {
    res.json(tour);
  } else {
    res.status(404).json({ message: 'Tour not found.' });
  }
});

// app.post('/api/tours/create-tour', (req: express.Request, res: express.Response) => {
//   const {
//     status,
//     tourNumber,
//     date,
//     inoTour,
//     invoiceNumber,
//     driver,
//     vehicle,
//     client,
//     description,
//     expenses,
//     amount,
//     documentation,
//     distributionType,
//     note,
//     invoiceAmountInOriginalCurrency,
//     amountInOriginalCurrency,
//     tourLength,
//     isDocumentBrought,
//   } = req.body;
//   const newTour = {
//     id: String(tours.items.length + 1),
//     no: tours.items.length + 1,
//     status,
//     tourNumber,
//     date,
//     inoTour,
//     invoiceNumber,
//     driver,
//     vehicle,
//     client,
//     description,
//     expenses,
//     amount,
//     documentation,
//     distributionType,
//     note,
//     invoiceAmountInOriginalCurrency,
//     amountInOriginalCurrency,
//     tourLength,
//     isDocumentBrought,
//   };
//   tours.items.push(newTour);
//   res.status(201).json(newTour);
// });

// app.put('/api/tours/update-tour', (req: express.Request, res: express.Response) => {
//   const {
//     id,
//     status,
//     tourNumber,
//     date,
//     inoTour,
//     invoiceNumber,
//     driver,
//     vehicle,
//     client,
//     description,
//     expenses,
//     amount,
//     documentation,
//     distributionType,
//     note,
//     invoiceAmountInOriginalCurrency,
//     amountInOriginalCurrency,
//     tourLength,
//     isDocumentBrought,
//   } = req.body;
//   const tourIndex = tours.items.findIndex((b) => b.id === id);
//   if (tourIndex !== -1) {
//     tours.items[tourIndex] = {
//       ...tours.items[tourIndex],
//       status,
//       tourNumber,
//       date,
//       inoTour,
//       invoiceNumber,
//       driver,
//       vehicle,
//       client,
//       description,
//       expenses,
//       amount,
//       documentation,
//       distributionType,
//       note,
//       invoiceAmountInOriginalCurrency,
//       amountInOriginalCurrency,
//       tourLength,
//       isDocumentBrought,
//     };
//     res.json(tours.items[tourIndex]);
//   } else {
//     res.status(404).json({ message: 'Tour not found.' });
//   }
// });

app.get('/api/expenses/expenses-list', (req: express.Request, res: express.Response) => {
  if (expenses.items.length === 0) {
    res.status(404).json({ message: 'No expenses found.' });
    return;
  }

  const result = paginateFilterSort(expenses.items, req.query, 'name');

  res.json(result);
});

app.get('/api/expenses/:expenseId', (req: express.Request, res: express.Response) => {
  const expenseId = req.params.expenseId;
  const expense = expenses.items.find((b) => b.id === expenseId);
  if (expense) {
    res.json(expense);
  } else {
    res.status(404).json({ message: 'Expense not found.' });
  }
});

app.post('/api/expenses/create-expense', (req: express.Request, res: express.Response) => {
  const { name } = req.body;
  const newExpense = {
    id: String(expenses.items.length + 1),
    no: expenses.items.length + 1,
    name,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    createdBy: 'admin',
  };
  expenses.items.push(newExpense);
  res.status(201).json(newExpense);
});

app.put('/api/expenses/update-expense', (req: express.Request, res: express.Response) => {
  const { id, name } = req.body;
  const expenseIndex = expenses.items.findIndex((b) => b.id === id);
  if (expenseIndex !== -1) {
    expenses.items[expenseIndex] = {
      ...expenses.items[expenseIndex],
      name,
      modifiedAt: new Date().toISOString(),
    };
    res.json(expenses.items[expenseIndex]);
  } else {
    res.status(404).json({ message: 'Expense not found.' });
  }
});

app.get('/api/fuels/fuels-list', (req: express.Request, res: express.Response) => {
  if (fuels.items.length === 0) {
    res.status(404).json({ message: 'No fuels found.' });
    return;
  }

  const result = paginateFilterSort(fuels.items, req.query, 'vehicle');

  res.json(result);
});

app.get('/api/fuels/:fuelId', (req: express.Request, res: express.Response) => {
  const fuelId = req.params.fuelId;
  const fuel = fuels.items.find((b) => b.id === fuelId);
  if (fuel) {
    res.json(fuel);
  } else {
    res.status(404).json({ message: 'Expense not found.' });
  }
});

app.post('/api/fuels/create-fuel', (req: express.Request, res: express.Response) => {
  const {
    date,
    user,
    type,
    vehicle,
    gasStation,
    description,
    total,
    tourLength,
    consumption,
    distance,
    liters,
    price,
  } = req.body;
  const newFuel = {
    id: String(fuels.items.length + 1),
    no: fuels.items.length + 1,
    date,
    user,
    type,
    vehicle,
    gasStation,
    description,
    total,
    tourLength,
    consumption,
    distance,
    liters,
    price,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  };
  fuels.items.push(newFuel);
  res.status(201).json(newFuel);
});

app.put('/api/fuels/update-fuel', (req: express.Request, res: express.Response) => {
  const {
    id,
    date,
    user,
    type,
    vehicle,
    gasStation,
    description,
    total,
    tourLength,
    consumption,
    distance,
    liters,
    price,
  } = req.body;
  const fuelIndex = fuels.items.findIndex((b) => b.id === id);
  if (fuelIndex !== -1) {
    fuels.items[fuelIndex] = {
      ...fuels.items[fuelIndex],
      date,
      user,
      type,
      vehicle,
      gasStation,
      description,
      total,
      tourLength,
      consumption,
      distance,
      liters,
      price,
    };
    res.json(fuels.items[fuelIndex]);
  } else {
    res.status(404).json({ message: 'Fuel not found.' });
  }
});

app.get('/api/fuel-pricings/fuel-pricings-list', (req: express.Request, res: express.Response) => {
  if (fuelPricings.items.length === 0) {
    res.status(404).json({ message: 'No fuel pricings found.' });
    return;
  }

  const result = paginateFilterSort(fuelPricings.items, req.query, 'price');

  res.json(result);
});

app.get('/api/fuel-pricings/:fuelPricingId', (req: express.Request, res: express.Response) => {
  const fuelPricingId = req.params.fuelPricingId;
  const fuelPricing = fuelPricings.items.find((b) => b.id === fuelPricingId);
  if (fuelPricing) {
    res.json(fuelPricing);
  } else {
    res.status(404).json({ message: 'Fuel pricing not found.' });
  }
});

app.post(
  '/api/fuel-pricings/create-fuel-pricing',
  (req: express.Request, res: express.Response) => {
    const { price, dateOfBeginningOfValidity } = req.body;
    const newFuelPricing = {
      id: String(fuelPricings.items.length + 1),
      no: fuelPricings.items.length + 1,
      dateOfBeginningOfValidity,
      price,
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
    fuelPricings.items.push(newFuelPricing);
    res.status(201).json(newFuelPricing);
  }
);

app.put('/api/fuel-pricings/update-fuel-pricing', (req: express.Request, res: express.Response) => {
  const { id, price, dateOfBeginningOfValidity } = req.body;
  const fuelPricingIndex = fuelPricings.items.findIndex((b) => b.id === id);
  if (fuelPricingIndex !== -1) {
    fuelPricings.items[fuelPricingIndex] = {
      ...fuelPricings.items[fuelPricingIndex],
      price,
      dateOfBeginningOfValidity,
      modifiedAt: new Date().toISOString(),
    };
    res.json(fuelPricings.items[fuelPricingIndex]);
  } else {
    res.status(404).json({ message: 'Fuel pricing not found.' });
  }
});

app.get('/api/containers/containers-list', (req: express.Request, res: express.Response) => {
  if (containers.items.length === 0) {
    res.status(404).json({ message: 'No containers found.' });
    return;
  }

  const result = paginateFilterSort(containers.items, req.query, 'carrier');

  res.json(result);
});

app.get('/api/containers/:containerId', (req: express.Request, res: express.Response) => {
  const containerId = req.params.containerId;
  const container = containers.items.find((b) => b.id === containerId);
  if (container) {
    res.json(container);
  } else {
    res.status(404).json({ message: 'Container not found.' });
  }
});

app.post('/api/containers/create-container', (req: express.Request, res: express.Response) => {
  const {
    dropOffDate,
    pickUpDate,
    client,
    carrier,
    droppedBy,
    pickedUpBy,
    containerNumber,
    description,
    waitingTime,
    price,
  } = req.body;
  const newContainer = {
    id: String(containers.items.length + 1),
    no: containers.items.length + 1,
    dropOffDate,
    pickUpDate,
    client,
    carrier,
    droppedBy,
    pickedUpBy,
    containerNumber,
    description,
    waitingTime,
    price,
  };
  containers.items.push(newContainer);
  res.status(201).json(newContainer);
});

app.put('/api/containers/update-container', (req: express.Request, res: express.Response) => {
  const {
    id,
    dropOffDate,
    pickUpDate,
    client,
    carrier,
    droppedBy,
    pickedUpBy,
    containerNumber,
    description,
    waitingTime,
    price,
  } = req.body;
  const containerIndex = containers.items.findIndex((b) => b.id === id);
  if (containerIndex !== -1) {
    containers.items[containerIndex] = {
      ...containers.items[containerIndex],
      dropOffDate,
      pickUpDate,
      client,
      carrier,
      droppedBy,
      pickedUpBy,
      containerNumber,
      description,
      waitingTime,
      price,
    };
    res.json(containers.items[containerIndex]);
  } else {
    res.status(404).json({ message: 'Container not found.' });
  }
});

app.get('/api/finance-desk/finance-desk-list', (req: express.Request, res: express.Response) => {
  if (financeDesk.items.length === 0) {
    res.status(404).json({ message: 'No finance desk found.' });
    return;
  }

  const result = paginateFilterSort(financeDesk.items, req.query, 'employee');

  res.json(result);
});

app.get('/api/finance-desk/:financeId', (req: express.Request, res: express.Response) => {
  const financeId = req.params.financeId;
  const finance = financeDesk.items.find((b) => b.id === financeId);
  if (finance) {
    res.json(finance);
  } else {
    res.status(404).json({ message: 'Finance not found.' });
  }
});

app.post(
  '/api/finance-desk/create-finance-desk-item',
  (req: express.Request, res: express.Response) => {
    const { serialNumber, date, employee, description, debt } = req.body;
    const newFinance = {
      id: String(financeDesk.items.length + 1),
      no: financeDesk.items.length + 1,
      serialNumber,
      date,
      employee,
      description,
      debt,
    };
    financeDesk.items.push(newFinance);
    res.status(201).json(newFinance);
  }
);

app.put(
  '/api/finance-desk/update-finance-desk-item',
  (req: express.Request, res: express.Response) => {
    const { id, serialNumber, date, employee, description, debt } = req.body;
    const financeIndex = financeDesk.items.findIndex((b) => b.id === id);
    if (financeIndex !== -1) {
      financeDesk.items[financeIndex] = {
        ...financeDesk.items[financeIndex],
        serialNumber,
        date,
        employee,
        description,
        debt,
      };
      res.json(financeDesk.items[financeIndex]);
    } else {
      res.status(404).json({ message: 'Finance not found.' });
    }
  }
);

app.get(
  '/api/employee-expenses/employee-expenses-list',
  (req: express.Request, res: express.Response) => {
    if (employeeExpenses.items.length === 0) {
      res.status(404).json({ message: 'No employee expenses found.' });
      return;
    }

    const result = paginateFilterSort(employeeExpenses.items, req.query, 'employee');

    res.json(result);
  }
);

app.get(
  '/api/employee-expenses/:employeeExpenseId',
  (req: express.Request, res: express.Response) => {
    const employeeExpenseId = req.params.employeeExpenseId;
    const employeeExpense = employeeExpenses.items.find((b) => b.id === employeeExpenseId);
    if (employeeExpense) {
      res.json(employeeExpense);
    } else {
      res.status(404).json({ message: 'Employee expense not found.' });
    }
  }
);

app.post(
  '/api/employee-expenses/create-employee-expense',
  (req: express.Request, res: express.Response) => {
    const { date, employee, description, debt } = req.body;
    const newEmployeeExpense = {
      id: String(employeeExpenses.items.length + 1),
      no: employeeExpenses.items.length + 1,
      employee,
      date,
      description,
      debt,
    };
    employeeExpenses.items.push(newEmployeeExpense);
    res.status(201).json(newEmployeeExpense);
  }
);

app.put(
  '/api/employee-expenses/update-employee-expense',
  (req: express.Request, res: express.Response) => {
    const { id, date, employee, description, debt } = req.body;
    const employeeExpenseIndex = employeeExpenses.items.findIndex((b) => b.id === id);
    if (employeeExpenseIndex !== -1) {
      employeeExpenses.items[employeeExpenseIndex] = {
        ...employeeExpenses.items[employeeExpenseIndex],
        date,
        employee,
        description,
        debt,
      };
      res.json(employeeExpenses.items[employeeExpenseIndex]);
    } else {
      res.status(404).json({ message: 'Employee expense not found.' });
    }
  }
);

app.get('/api/compensations/compensations-list', (req: express.Request, res: express.Response) => {
  if (compensations.items.length === 0) {
    res.status(404).json({ message: 'No compensations found.' });
    return;
  }

  const result = paginateFilterSort(compensations.items, req.query, 'document');

  res.json(result);
});

app.get('/api/compensations/:compensationId', (req: express.Request, res: express.Response) => {
  const compensationId = req.params.compensationId;
  const user = compensations.items.find((b) => b.id === compensationId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'Compensation not found.' });
  }
});

app.post(
  '/api/compensations/create-compensation',
  (req: express.Request, res: express.Response) => {
    const {
      document,
      compensationType,
      client,
      description,
      date,
      currencyDate,
      baseAmount,
      vat,
      total,
      nbsExchangeRate,
    } = req.body;
    const newCompensation = {
      id: String(compensations.items.length + 1),
      no: compensations.items.length + 1,
      document,
      compensationType,
      client,
      description,
      date,
      currencyDate,
      baseAmount,
      vat,
      total,
      nbsExchangeRate,
    };
    compensations.items.push(newCompensation);
    res.status(201).json(newCompensation);
  }
);

app.put('/api/compensations/update-compensation', (req: express.Request, res: express.Response) => {
  const {
    id,
    document,
    compensationType,
    client,
    description,
    date,
    currencyDate,
    baseAmount,
    vat,
    total,
    nbsExchangeRate,
  } = req.body;
  const compensationIndex = compensations.items.findIndex((b) => b.id === id);
  if (compensationIndex !== -1) {
    compensations.items[compensationIndex] = {
      ...compensations.items[compensationIndex],
      document,
      compensationType,
      client,
      description,
      date,
      currencyDate,
      baseAmount,
      vat,
      total,
      nbsExchangeRate,
    };
    res.json(compensations.items[compensationIndex]);
  } else {
    res.status(404).json({ message: 'Compensation not found.' });
  }
});

app.get(
  '/api/compensation-documents/compensation-document-list',
  (req: express.Request, res: express.Response) => {
    if (compensationDocuments.items.length === 0) {
      res.status(404).json({ message: 'No compensation documents found.' });
      return;
    }

    const result = paginateFilterSort(compensationDocuments.items, req.query, 'partner');

    res.json(result);
  }
);

app.post(
  '/api/compensation-documents/create-compensation-document',
  (req: express.Request, res: express.Response) => {
    const { partner, invoice, bill, amount, compensated, compensationId } = req.body;
    const newCompensationDocument = {
      id: String(compensationDocuments.items.length + 1),
      no: compensationDocuments.items.length + 1,
      partner,
      invoice,
      bill,
      amount,
      compensated,
      compensationId,
    };
    compensationDocuments.items.push(newCompensationDocument);
    res.status(201).json(newCompensationDocument);
  }
);

app.put(
  '/api/compensation-documents/update-compensation-document',
  (req: express.Request, res: express.Response) => {
    const { id, partner, invoice, bill, amount, compensated, compensationId } = req.body;
    const compensationDocumentIndex = compensationDocuments.items.findIndex((b) => b.id === id);
    if (compensationDocumentIndex !== -1) {
      compensationDocuments.items[compensationDocumentIndex] = {
        ...compensationDocuments.items[compensationDocumentIndex],
        partner,
        invoice,
        bill,
        amount,
        compensated,
        compensationId,
      };
      res.json(compensationDocuments.items[compensationDocumentIndex]);
    } else {
      res.status(404).json({ message: 'Compensation document not found.' });
    }
  }
);

app.get('/api/bills/bills-list', (req: express.Request, res: express.Response) => {
  if (bills.items.length === 0) {
    res.status(404).json({ message: 'No bills found.' });
    return;
  }

  const result = paginateFilterSort(bills.items, req.query, 'deliver');

  res.json(result);
});

app.get('/api/bills/:billId', (req: express.Request, res: express.Response) => {
  const billId = req.params.billId;
  const bill = bills.items.find((b) => b.id === billId);
  if (bill) {
    res.json(bill);
  } else {
    res.status(404).json({ message: 'Bill not found.' });
  }
});

app.post('/api/bills/create-bill', (req: express.Request, res: express.Response) => {
  const {
    documentName,
    deliver,
    date,
    currencyDate,
    supplier,
    status,
    nbsExchangeRate,
    baseAmount,
    taxAmount,
    totalAmount,
    description,
  } = req.body;
  const newBill = {
    id: String(bills.items.length + 1),
    no: bills.items.length + 1,
    documentName,
    deliver,
    date,
    currencyDate,
    supplier,
    status,
    nbsExchangeRate,
    baseAmount,
    taxAmount,
    totalAmount,
    description,
  };
  bills.items.push(newBill);
  res.status(201).json(newBill);
});

app.put('/api/bills/update-bill', (req: express.Request, res: express.Response) => {
  const {
    id,
    documentName,
    deliver,
    date,
    currencyDate,
    supplier,
    status,
    nbsExchangeRate,
    baseAmount,
    taxAmount,
    totalAmount,
    description,
  } = req.body;
  const billIndex = bills.items.findIndex((b) => b.id === id);
  if (billIndex !== -1) {
    bills.items[billIndex] = {
      ...bills.items[billIndex],
      documentName,
      deliver,
      date,
      currencyDate,
      supplier,
      status,
      nbsExchangeRate,
      baseAmount,
      taxAmount,
      totalAmount,
      description,
    };
    res.json(bills.items[billIndex]);
  } else {
    res.status(404).json({ message: 'Bill not found.' });
  }
});

app.get('/api/invoices/invoices-list', (req: express.Request, res: express.Response) => {
  if (invoices.items.length === 0) {
    res.status(404).json({ message: 'No invoices found.' });
    return;
  }

  const result = paginateFilterSort(invoices.items, req.query, 'documentNumber');

  res.json(result);
});

app.get('/api/invoices/:invoiceId', (req: express.Request, res: express.Response) => {
  const invoiceId = req.params.invoiceId;
  const invoice = invoices.items.find((invoice) => invoice.id === invoiceId);
  if (invoice) {
    res.json(invoice);
  } else {
    res.status(404).json({ message: 'Invoice not found.' });
  }
});

app.post('/api/invoices/create-invoice', (req: express.Request, res: express.Response) => {
  const {
    international,
    documentNumber,
    client,
    transactionDate,
    issueDate,
    currencyDate,
    nbsExchangeRate,
    bankAccount,
    description,
    note,
  } = req.body;
  const newInvoice = {
    id: String(invoices.items.length + 1),
    no: invoices.items.length + 1,
    international,
    documentNumber,
    client,
    transactionDate,
    issueDate,
    currencyDate,
    nbsExchangeRate,
    bankAccount,
    description,
    note,
  };
  invoices.items.push(newInvoice);
  res.status(201).json(newInvoice);
});

app.put('/api/invoices/update-invoice', (req: express.Request, res: express.Response) => {
  const {
    id,
    international,
    documentNumber,
    client,
    transactionDate,
    issueDate,
    currencyDate,
    nbsExchangeRate,
    bankAccount,
    description,
    note,
  } = req.body;
  const invoiceIndex = invoices.items.findIndex((b) => b.id === id);
  if (invoiceIndex !== -1) {
    invoices.items[invoiceIndex] = {
      ...invoices.items[invoiceIndex],
      international,
      documentNumber,
      client,
      transactionDate,
      issueDate,
      currencyDate,
      nbsExchangeRate,
      bankAccount,
      description,
      note,
    };
    res.json(invoices.items[invoiceIndex]);
  } else {
    res.status(404).json({ message: 'Invoice not found.' });
  }
});

app.get('/api/statements/statements-list', (req: express.Request, res: express.Response) => {
  if (statements.items.length === 0) {
    res.status(404).json({ message: 'No statements found.' });
    return;
  }

  const result = paginateFilterSort(statements.items, req.query, 'statementNumber');

  res.json(result);
});

app.get('/api/statements/:statementId', (req: express.Request, res: express.Response) => {
  const statementId = req.params.statementId;
  const statement = statements.items.find((statement) => statement.id === statementId);
  if (statement) {
    res.json(statement);
  } else {
    res.status(404).json({ message: 'Statement not found.' });
  }
});

app.post('/api/statements/create-statement', (req: express.Request, res: express.Response) => {
  const {
    statementNumber,
    bank,
    note,
    accountNumber,
    previousState,
    newState,
    debt,
    demand,
    previousBalance,
    currentBalance,
  } = req.body;
  const newStatement = {
    id: String(statements.items.length + 1),
    no: statements.items.length + 1,
    statementNumber,
    bank,
    note,
    accountNumber,
    previousState,
    newState,
    debt,
    demand,
    previousBalance,
    currentBalance,
    date: new Date().toISOString(),
  };
  statements.items.push(newStatement);
  res.status(201).json(newStatement);
});

app.put('/api/statements/update-statement', (req: express.Request, res: express.Response) => {
  const {
    id,
    statementNumber,
    bank,
    note,
    accountNumber,
    previousState,
    newState,
    debt,
    demand,
    previousBalance,
    currentBalance,
  } = req.body;
  const statementIndex = statements.items.findIndex((b) => b.id === id);
  if (statementIndex !== -1) {
    statements.items[statementIndex] = {
      ...statements.items[statementIndex],
      statementNumber,
      bank,
      note,
      accountNumber,
      previousState,
      newState,
      debt,
      demand,
      previousBalance,
      currentBalance,
      date: new Date().toISOString(),
    };
    res.json(statements.items[statementIndex]);
  } else {
    res.status(404).json({ message: 'Statement not found.' });
  }
});

app.get('/api/equipment/equipments-list', (req: express.Request, res: express.Response) => {
  if (equipments.items.length === 0) {
    res.status(404).json({ message: 'No equipments found.' });
    return;
  }

  const result = paginateFilterSort(equipments.items, req.query, 'name');

  res.json(result);
});

app.get('/api/equipment/:equipmentId', (req: express.Request, res: express.Response) => {
  const equipmentId = req.params.equipmentId;
  const equipment = equipments.items.find((b) => b.id === equipmentId);
  if (equipment) {
    res.json(equipment);
  } else {
    res.status(404).json({ message: 'Equipment not found.' });
  }
});

app.post('/api/equipment/create-equipment-item', (req: express.Request, res: express.Response) => {
  const { name } = req.body;
  const newEquipment = {
    id: String(equipments.items.length + 1),
    no: equipments.items.length + 1,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
  };
  equipments.items.push(newEquipment);
  res.status(201).json(newEquipment);
});

app.put('/api/equipment/update-equipment-item', (req: express.Request, res: express.Response) => {
  const { id, name } = req.body;
  const equipmentIndex = equipments.items.findIndex((b) => b.id === id);
  if (equipmentIndex !== -1) {
    equipments.items[equipmentIndex] = {
      ...equipments.items[equipmentIndex],
      name,
      updatedAt: new Date().toISOString(),
    };
    res.json(equipments.items[equipmentIndex]);
  } else {
    res.status(404).json({ message: 'Equipment not found.' });
  }
});

app.get('/api/stimulations/stimulations-list', (req: express.Request, res: express.Response) => {
  if (stimulations.items.length === 0) {
    res.status(404).json({ message: 'No stimulations found.' });
    return;
  }

  const result = paginateFilterSort(stimulations.items, req.query, 'employee');

  res.json(result);
});

app.get('/api/stimulations/:stimulationsId', (req: express.Request, res: express.Response) => {
  const stimulationsId = req.params.stimulationsId;
  const stimulation = stimulations.items.find((b) => b.id === stimulationsId);
  if (stimulation) {
    res.json(stimulation);
  } else {
    res.status(404).json({ message: 'Stimulations not found.' });
  }
});

app.post('/api/stimulations/create-stimulation', (req: express.Request, res: express.Response) => {
  const { type, employee, date, amount, description } = req.body;
  const newStimulation = {
    id: String(stimulations.items.length + 1),
    no: stimulations.items.length + 1,
    type,
    employee,
    date,
    amount,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
  };
  stimulations.items.push(newStimulation);
  res.status(201).json(newStimulation);
});

app.put('/api/stimulations/update-stimulation', (req: express.Request, res: express.Response) => {
  const { id, type, employee, date, amount, description } = req.body;
  const stimulationIndex = stimulations.items.findIndex((b) => b.id === id);
  if (stimulationIndex !== -1) {
    stimulations.items[stimulationIndex] = {
      ...stimulations.items[stimulationIndex],
      type,
      employee,
      date,
      amount,
      description,
      updatedAt: new Date().toISOString(),
    };
    res.json(stimulations.items[stimulationIndex]);
  } else {
    res.status(404).json({ message: 'Stimulation not found.' });
  }
});

app.get('/api/suspensions/suspensions-list', (req: express.Request, res: express.Response) => {
  if (suspensions.items.length === 0) {
    res.status(404).json({ message: 'No suspensions found.' });
    return;
  }

  const result = paginateFilterSort(suspensions.items, req.query, 'employee');

  res.json(result);
});

app.get('/api/suspensions/:suspensionId', (req: express.Request, res: express.Response) => {
  const suspensionId = req.params.suspensionId;
  const suspension = suspensions.items.find((b) => b.id === suspensionId);
  if (suspension) {
    res.json(suspension);
  } else {
    res.status(404).json({ message: 'Suspension not found.' });
  }
});

app.post('/api/suspensions/create-suspension', (req: express.Request, res: express.Response) => {
  const { type, employee, date, amount, description, firstInstallmentDate } = req.body;
  const newSuspension = {
    id: String(suspensions.items.length + 1),
    no: suspensions.items.length + 1,
    type,
    employee,
    date,
    amount,
    description,
    firstInstallmentDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
  };
  suspensions.items.push(newSuspension);
  res.status(201).json(newSuspension);
});

app.put('/api/suspensions/update-suspension', (req: express.Request, res: express.Response) => {
  const { id, type, employee, date, amount, description, firstInstallmentDate } = req.body;
  const suspensionIndex = suspensions.items.findIndex((b) => b.id === id);
  if (suspensionIndex !== -1) {
    suspensions.items[suspensionIndex] = {
      ...suspensions.items[suspensionIndex],
      type,
      employee,
      date,
      amount,
      description,
      firstInstallmentDate,
      updatedAt: new Date().toISOString(),
    };
    res.json(suspensions.items[suspensionIndex]);
  } else {
    res.status(404).json({ message: 'Suspension not found.' });
  }
});

app.get('/api/payments/payments-list', (req: express.Request, res: express.Response) => {
  if (payments.items.length === 0) {
    res.status(404).json({ message: 'No payments found.' });
    return;
  }

  const result = paginateFilterSort(payments.items, req.query, 'employee');

  res.json(result);
});

app.get('/api/payments/:paymentId', (req: express.Request, res: express.Response) => {
  const paymentId = req.params.paymentId;
  const payment = payments.items.find((b) => b.id === paymentId);
  if (payment) {
    res.json(payment);
  } else {
    res.status(404).json({ message: 'Payment not found.' });
  }
});

app.post('/api/payments/create-payment', (req: express.Request, res: express.Response) => {
  const { employee, date, amount, description } = req.body;
  const newPayment = {
    id: String(payments.items.length + 1),
    no: payments.items.length + 1,
    employee,
    date,
    amount,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
  };
  payments.items.push(newPayment);
  res.status(201).json(newPayment);
});

app.put('/api/payments/update-payment', (req: express.Request, res: express.Response) => {
  const { id, employee, date, amount, description } = req.body;
  const paymentIndex = payments.items.findIndex((b) => b.id === id);
  if (paymentIndex !== -1) {
    payments.items[paymentIndex] = {
      ...payments.items[paymentIndex],
      employee,
      date,
      amount,
      description,
      updatedAt: new Date().toISOString(),
    };
    res.json(payments.items[paymentIndex]);
  } else {
    res.status(404).json({ message: 'Payment not found.' });
  }
});

app.get('/api/calculations/calculations-list', (req: express.Request, res: express.Response) => {
  if (calculations.items.length === 0) {
    res.status(404).json({ message: 'No calculations found.' });
    return;
  }

  const result = paginateFilterSort(calculations.items, req.query, 'employee');

  res.json(result);
});

app.get('/api/calculations/:calculationId', (req: express.Request, res: express.Response) => {
  const calculationId = req.params.calculationId;
  const calculation = calculations.items.find((b) => b.id === calculationId);
  if (calculation) {
    res.json(calculation);
  } else {
    res.status(404).json({ message: 'Calculation not found.' });
  }
});

app.post('/api/calculations/create-calculation', (req: express.Request, res: express.Response) => {
  const { employee, date, amount, description, salary, month, year } = req.body;
  const newCalculation = {
    id: String(calculations.items.length + 1),
    no: calculations.items.length + 1,
    employee,
    date,
    amount,
    description,
    salary,
    month,
    year,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
  };
  calculations.items.push(newCalculation);
  res.status(201).json(newCalculation);
});

app.put('/api/calculations/update-calculation', (req: express.Request, res: express.Response) => {
  const { id, employee, date, amount, description, salary, month, year } = req.body;
  const calculationIndex = calculations.items.findIndex((b) => b.id === id);
  if (calculationIndex !== -1) {
    calculations.items[calculationIndex] = {
      ...calculations.items[calculationIndex],
      employee,
      date,
      amount,
      description,
      salary,
      month,
      year,
      updatedAt: new Date().toISOString(),
    };
    res.json(calculations.items[calculationIndex]);
  } else {
    res.status(404).json({ message: 'Calculation not found.' });
  }
});

app.listen(PORT, () => {
  console.log(`Mock server is running at http://localhost:${PORT}`);
});
