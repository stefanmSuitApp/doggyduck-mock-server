import cors from 'cors';
import express from 'express';

import { banks } from '../db/banks';
import { bills } from '../db/bills';
import { calculations } from '../db/calculations';
import { clients } from '../db/clients';
import { compensations } from '../db/compensations';
import { containers } from '../db/containers';
import { employeeExpenses } from '../db/employeeExpenses';
import { employees } from '../db/employees';
import { equipments } from '../db/equipments';
import { expenses } from '../db/expenses';
import { financeDesk } from '../db/financeDesk';
import { fuelPricings } from '../db/fuelPricings';
import { meInfo } from '../db/meInfo';
import { nisPrices } from '../db/nisPrices';
import { partners } from '../db/partners';
import { payments } from '../db/payments';
import { stimulations } from '../db/stimulations';
import { suppliers } from '../db/suppliers';
import { suspensions } from '../db/suspensions';
import { tours } from '../db/tours';
import { users } from '../db/users';

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
  res.json(banks);
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

app.get('/api/clients/clients-list', (req: express.Request, res: express.Response) => {
  res.json(clients);
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

app.get('/api/suppliers/suppliers-list', (req: express.Request, res: express.Response) => {
  res.json(suppliers);
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

app.get('/api/employees/employees-list', (req: express.Request, res: express.Response) => {
  res.json(employees);
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

app.get('/api/partners/partners-list', (req: express.Request, res: express.Response) => {
  res.json(partners);
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

app.get('/api/tours/tours-list', (req: express.Request, res: express.Response) => {
  res.json(tours);
});

app.get('/api/tours/:tourId', (req: express.Request, res: express.Response) => {
  const tourId = req.params.tourId;
  const tour = tours.items.find((b) => b.id === tourId);
  if (tour) {
    res.json(tour);
  } else {
    res.status(404).json({ message: 'Tour not found.' });
  }
});

app.get('/api/expenses/expenses-list', (req: express.Request, res: express.Response) => {
  res.json(expenses);
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

app.get('/api/fuel-pricings/fuel-pricings-list', (req: express.Request, res: express.Response) => {
  res.json(fuelPricings);
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

app.get('/api/containers/containers-list', (req: express.Request, res: express.Response) => {
  res.json(containers);
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

app.get('/api/finance-desk/finance-desk-list', (req: express.Request, res: express.Response) => {
  res.json(financeDesk);
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

app.get(
  '/api/employee-expenses/employee-expenses-list',
  (req: express.Request, res: express.Response) => {
    res.json(employeeExpenses);
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

app.get('/api/compensations/compensations-list', (req: express.Request, res: express.Response) => {
  res.json(compensations);
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

app.get('/api/bills/bills-list', (req: express.Request, res: express.Response) => {
  res.json(bills);
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

app.get('/api/invoices/invoices-list', (req: express.Request, res: express.Response) => {
  res.json(bills);
});

app.get('/api/invoices/:invoiceId', (req: express.Request, res: express.Response) => {
  const invoiceId = req.params.invoiceId;
  const invoice = bills.items.find((b) => b.id === invoiceId);
  if (invoice) {
    res.json(invoice);
  } else {
    res.status(404).json({ message: 'Invoice not found.' });
  }
});

app.get('/api/statements/statements-list', (req: express.Request, res: express.Response) => {
  res.json(bills);
});

app.get('/api/statements/:statementId', (req: express.Request, res: express.Response) => {
  const statementId = req.params.statementId;
  const statement = bills.items.find((b) => b.id === statementId);
  if (statement) {
    res.json(statement);
  } else {
    res.status(404).json({ message: 'Statement not found.' });
  }
});

app.get('/api/equipments/equipments-list', (req: express.Request, res: express.Response) => {
  res.json(equipments);
});

app.get('/api/equipments/:equipmentId', (req: express.Request, res: express.Response) => {
  const equipmentId = req.params.equipmentId;
  const equipment = equipments.items.find((b) => b.id === equipmentId);
  if (equipment) {
    res.json(equipment);
  } else {
    res.status(404).json({ message: 'Equipment not found.' });
  }
});

app.get('/api/stimulations/stimulations-list', (req: express.Request, res: express.Response) => {
  res.json(stimulations);
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

app.get('/api/suspensions/suspensions-list', (req: express.Request, res: express.Response) => {
  res.json(suspensions);
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

app.get('/api/payments/payments-list', (req: express.Request, res: express.Response) => {
  res.json(payments);
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

app.get('/api/calculations/calculations-list', (req: express.Request, res: express.Response) => {
  res.json(calculations);
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

app.listen(PORT, () => {
  console.log(`Mock server is running at http://localhost:${PORT}`);
});
