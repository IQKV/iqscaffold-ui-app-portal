// Contact Service Mock Handlers
// Following existing CRM and billing patterns

import { http, HttpResponse, delay } from "msw";
import {
  type Contact,
  type CreateContactRequest,
  type UpdateContactRequest,
  type BulkCreateContactsRequest,
  type BulkUpdateStatusRequest,
  type BulkDeleteContactsRequest,
  type BulkUpdateLeadScoresRequest,
  type BulkOperationResponse,
  type PaginatedResponse,
  ContactStatus,
} from "@/shared/api/contact/types";
import { getConfig } from "@/app/config";
import { ENV_KEYS } from "@/shared/constants";

const API_BASE_URL = getConfig(ENV_KEYS.API_SERVER_URL) || "";

// Mock configuration
const config = {
  delay: 300, // Simulate network delay
  enableErrors: false, // Toggle to test error scenarios
};

// Mock data store
const mockContacts: Contact[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1-555-0101",
    jobTitle: "CEO",
    companyId: 1,
    status: ContactStatus.ACTIVE,
    leadScore: 85,
    notes: "Converted from lead. High priority contact.",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    createdBy: "system",
    lastModifiedBy: "admin",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@techcorp.com",
    phone: "+1-555-0102",
    jobTitle: "CTO",
    companyId: 2,
    status: ContactStatus.ACTIVE,
    leadScore: 92,
    notes: "Key decision maker. Interested in enterprise plan.",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
    createdBy: "sales-rep",
    lastModifiedBy: "sales-rep",
  },
  {
    id: 3,
    firstName: "Bob",
    lastName: "Johnson",
    email: "bob.johnson@startup.io",
    phone: "+1-555-0103",
    jobTitle: "Founder",
    companyId: 3,
    status: ContactStatus.ACTIVE,
    leadScore: 78,
    notes: "Early stage startup. Budget constraints.",
    createdAt: "2024-01-12T11:30:00Z",
    updatedAt: "2024-01-19T10:15:00Z",
    createdBy: "marketing",
    lastModifiedBy: "sales-rep",
  },
  {
    id: 4,
    firstName: "Alice",
    lastName: "Williams",
    email: "alice.williams@enterprise.com",
    phone: "+1-555-0104",
    jobTitle: "VP of Operations",
    companyId: 4,
    status: ContactStatus.INACTIVE,
    leadScore: 45,
    notes: "Lost interest. Follow up in Q3.",
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-22T13:20:00Z",
    createdBy: "sales-rep",
    lastModifiedBy: "admin",
  },
];

const mockCompanies: any[] = [
  {
    id: 1,
    name: "Acme Corp",
    website: "https://acme.example.com",
    industry: "Manufacturing",
    size: "ENTERPRISE",
    phone: "+1-555-1001",
    email: "info@acme.example.com",
    city: "New York",
    country: "USA",
    status: "ACTIVE",
    createdAt: "2023-10-01T12:00:00Z",
    updatedAt: "2023-11-05T15:30:00Z",
  },
  {
    id: 2,
    name: "TechCorp Solutions",
    website: "https://techcorp.io",
    industry: "Software",
    size: "MID_MARKET",
    phone: "+1-555-2002",
    email: "contact@techcorp.io",
    city: "San Francisco",
    country: "USA",
    status: "ACTIVE",
    createdAt: "2023-11-15T09:00:00Z",
    updatedAt: "2024-01-10T11:45:00Z",
  },
  {
    id: 3,
    name: "Startup Ventures",
    website: "https://ventures.io",
    industry: "Venture Capital",
    size: "SMALL",
    phone: "+1-555-3003",
    email: "deals@ventures.io",
    city: "London",
    country: "UK",
    status: "PROSPECT",
    createdAt: "2024-01-05T14:20:00Z",
    updatedAt: "2024-01-05T14:20:00Z",
  },
];

let nextId = 5;
let nextCompanyId = 4;

export const contactsHandlers = [
  // Get all contacts with pagination and filtering
  http.get(`${API_BASE_URL}/v1/contacts`, async ({ request }) => {
    if (config.delay) {
      await delay(config.delay);
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "0", 10);
    const size = parseInt(url.searchParams.get("size") || "10", 10);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") as ContactStatus | null;

    // Filter contacts
    let filtered = [...mockContacts];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (contact) =>
          contact.firstName.toLowerCase().includes(searchLower) ||
          contact.lastName.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower) ||
          contact.jobTitle?.toLowerCase().includes(searchLower),
      );
    }

    if (status) {
      filtered = filtered.filter((contact) => contact.status === status);
    }

    // Paginate
    const start = page * size;
    const end = start + size;
    const paginatedContacts = filtered.slice(start, end);

    const response: PaginatedResponse<Contact> = {
      content: paginatedContacts,
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      first: page === 0,
      last: end >= filtered.length,
    };

    return HttpResponse.json(response);
  }),

  // Get contact by ID
  http.get(`${API_BASE_URL}/v1/contacts/:id`, async ({ params }) => {
    if (config.delay) {
      await delay(config.delay);
    }

    const { id } = params;
    const contactId = parseInt(id as string, 10);
    const contact = mockContacts.find((c) => c.id === contactId);

    if (!contact) {
      return HttpResponse.json(
        {
          error: "Contact not found",
          message: `Contact with ID ${id} does not exist`,
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(contact);
  }),

  // Create contact
  http.post(`${API_BASE_URL}/v1/contacts`, async ({ request }) => {
    if (config.delay) {
      await delay(config.delay);
    }

    const body = (await request.json()) as CreateContactRequest;

    // Check for duplicate email
    const existingContact = mockContacts.find((c) => c.email === body.email);
    if (existingContact) {
      return HttpResponse.json(
        {
          error: "Duplicate email",
          message: `Contact with email ${body.email} already exists`,
        },
        { status: 409 },
      );
    }

    const newContact: Contact = {
      id: nextId++,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      jobTitle: body.jobTitle,
      companyId: body.companyId,
      status: body.status || ContactStatus.ACTIVE,
      leadScore: body.leadScore || 0,
      notes: body.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "current-user",
      lastModifiedBy: "current-user",
    };

    mockContacts.push(newContact);

    return HttpResponse.json(newContact, { status: 201 });
  }),

  // Update contact
  http.put(`${API_BASE_URL}/v1/contacts/:id`, async ({ params, request }) => {
    if (config.delay) {
      await delay(config.delay);
    }

    const { id } = params;
    const contactId = parseInt(id as string, 10);
    const body = (await request.json()) as UpdateContactRequest;

    const contactIndex = mockContacts.findIndex((c) => c.id === contactId);

    if (contactIndex === -1) {
      return HttpResponse.json(
        {
          error: "Contact not found",
          message: `Contact with ID ${id} does not exist`,
        },
        { status: 404 },
      );
    }

    // Check for duplicate email if email is being changed
    if (body.email && body.email !== mockContacts[contactIndex].email) {
      const existingContact = mockContacts.find((c) => c.email === body.email);
      if (existingContact) {
        return HttpResponse.json(
          {
            error: "Duplicate email",
            message: `Contact with email ${body.email} already exists`,
          },
          { status: 409 },
        );
      }
    }

    const updatedContact: Contact = {
      ...mockContacts[contactIndex],
      ...body,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: "current-user",
    };

    mockContacts[contactIndex] = updatedContact;

    return HttpResponse.json(updatedContact);
  }),

  // Delete contact
  http.delete(`${API_BASE_URL}/v1/contacts/:id`, async ({ params }) => {
    if (config.delay) {
      await delay(config.delay);
    }

    const { id } = params;
    const contactId = parseInt(id as string, 10);
    const contactIndex = mockContacts.findIndex((c) => c.id === contactId);

    if (contactIndex === -1) {
      return HttpResponse.json(
        {
          error: "Contact not found",
          message: `Contact with ID ${id} does not exist`,
        },
        { status: 404 },
      );
    }

    mockContacts.splice(contactIndex, 1);

    return HttpResponse.json(null, { status: 204 });
  }),

  // Get contacts by company
  http.get(`${API_BASE_URL}/v1/contacts/company/:companyId`, async ({ params }) => {
    if (config.delay) {
      await delay(config.delay);
    }

    const { companyId } = params;
    const companyIdNum = parseInt(companyId as string, 10);
    const contacts = mockContacts.filter((c) => c.companyId === companyIdNum);

    return HttpResponse.json(contacts);
  }),

  // Update lead score
  http.patch(`${API_BASE_URL}/v1/contacts/:id/score`, async ({ params, request }) => {
    if (config.delay) {
      await delay(config.delay);
    }

    const { id } = params;
    const contactId = parseInt(id as string, 10);
    const body = (await request.json()) as { leadScore: number };

    const contactIndex = mockContacts.findIndex((c) => c.id === contactId);

    if (contactIndex === -1) {
      return HttpResponse.json(
        {
          error: "Contact not found",
          message: `Contact with ID ${id} does not exist`,
        },
        { status: 404 },
      );
    }

    mockContacts[contactIndex] = {
      ...mockContacts[contactIndex],
      leadScore: body.leadScore,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: "current-user",
    };

    return HttpResponse.json(mockContacts[contactIndex]);
  }),

  // Bulk create contacts
  http.post(`${API_BASE_URL}/v1/contacts/bulk`, async ({ request }) => {
    if (config.delay) {
      await delay(config.delay * 2); // Longer delay for bulk operations
    }

    const body = (await request.json()) as BulkCreateContactsRequest;
    let successCount = 0;
    const errors: Array<{ id: number; error: string }> = [];

    body.contacts.forEach((contactRequest, index) => {
      // Check for duplicate email
      const existingContact = mockContacts.find((c) => c.email === contactRequest.email);
      if (existingContact) {
        errors.push({
          id: index,
          error: `Contact with email ${contactRequest.email} already exists`,
        });
        return;
      }

      const newContact: Contact = {
        id: nextId++,
        firstName: contactRequest.firstName,
        lastName: contactRequest.lastName,
        email: contactRequest.email,
        phone: contactRequest.phone,
        jobTitle: contactRequest.jobTitle,
        companyId: contactRequest.companyId,
        status: contactRequest.status || ContactStatus.ACTIVE,
        leadScore: contactRequest.leadScore || 0,
        notes: contactRequest.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "current-user",
        lastModifiedBy: "current-user",
      };

      mockContacts.push(newContact);
      successCount++;
    });

    const response: BulkOperationResponse = {
      successCount,
      failureCount: errors.length,
      errors,
    };

    return HttpResponse.json(response);
  }),

  // Bulk update status
  http.patch(`${API_BASE_URL}/v1/contacts/bulk/status`, async ({ request }) => {
    if (config.delay) {
      await delay(config.delay * 2);
    }

    const body = (await request.json()) as BulkUpdateStatusRequest;
    let successCount = 0;
    const errors: Array<{ id: number; error: string }> = [];

    body.contactIds.forEach((contactId) => {
      const contactIndex = mockContacts.findIndex((c) => c.id === contactId);

      if (contactIndex === -1) {
        errors.push({
          id: contactId,
          error: `Contact with ID ${contactId} not found`,
        });
        return;
      }

      mockContacts[contactIndex] = {
        ...mockContacts[contactIndex],
        status: body.status,
        updatedAt: new Date().toISOString(),
        lastModifiedBy: "current-user",
      };

      successCount++;
    });

    const response: BulkOperationResponse = {
      successCount,
      failureCount: errors.length,
      errors,
    };

    return HttpResponse.json(response);
  }),

  // Bulk delete contacts
  http.delete(`${API_BASE_URL}/v1/contacts/bulk`, async ({ request }) => {
    if (config.delay) {
      await delay(config.delay * 2);
    }

    const body = (await request.json()) as BulkDeleteContactsRequest;
    let successCount = 0;
    const errors: Array<{ id: number; error: string }> = [];

    body.contactIds.forEach((contactId) => {
      const contactIndex = mockContacts.findIndex((c) => c.id === contactId);

      if (contactIndex === -1) {
        errors.push({
          id: contactId,
          error: `Contact with ID ${contactId} not found`,
        });
        return;
      }

      mockContacts.splice(contactIndex, 1);
      successCount++;
    });

    const response: BulkOperationResponse = {
      successCount,
      failureCount: errors.length,
      errors,
    };

    return HttpResponse.json(response);
  }),

  // Bulk update lead scores
  http.patch(`${API_BASE_URL}/v1/contacts/bulk/scores`, async ({ request }) => {
    if (config.delay) {
      await delay(config.delay * 2);
    }

    const body = (await request.json()) as BulkUpdateLeadScoresRequest;
    let successCount = 0;
    const errors: Array<{ id: number; error: string }> = [];

    body.updates.forEach((update) => {
      const contactIndex = mockContacts.findIndex((c) => c.id === update.contactId);

      if (contactIndex === -1) {
        errors.push({
          id: update.contactId,
          error: `Contact with ID ${update.contactId} not found`,
        });
        return;
      }

      mockContacts[contactIndex] = {
        ...mockContacts[contactIndex],
        leadScore: update.leadScore,
        updatedAt: new Date().toISOString(),
        lastModifiedBy: "current-user",
      };

      successCount++;
    });

    const response: BulkOperationResponse = {
      successCount,
      failureCount: errors.length,
      errors,
    };

    return HttpResponse.json(response);
  }),

  // Company Handlers
  // Get all companies with pagination and filtering
  http.get(`${API_BASE_URL}/v1/companies`, async ({ request }) => {
    if (config.delay) {
      await delay(config.delay);
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "0", 10);
    const size = parseInt(url.searchParams.get("size") || "10", 10);
    const search = url.searchParams.get("search") || "";
    const industry = url.searchParams.get("industry") || "";

    // Filter companies
    let filtered = [...mockCompanies];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(searchLower) ||
          company.email?.toLowerCase().includes(searchLower) ||
          company.website?.toLowerCase().includes(searchLower),
      );
    }

    if (industry) {
      filtered = filtered.filter((company) => company.industry === industry);
    }

    // Paginate
    const start = page * size;
    const end = start + size;
    const paginatedCompanies = filtered.slice(start, end);

    const response: any = {
      content: paginatedCompanies,
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      first: page === 0,
      last: end >= filtered.length,
    };

    return HttpResponse.json(response);
  }),

  // Get company by ID
  http.get(`${API_BASE_URL}/v1/companies/:id`, async ({ params }) => {
    if (config.delay) {
      await delay(config.delay);
    }

    const { id } = params;
    const companyId = parseInt(id as string, 10);
    const company = mockCompanies.find((c) => c.id === companyId);

    if (!company) {
      return HttpResponse.json(
        {
          error: "Company not found",
          message: `Company with ID ${id} does not exist`,
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(company);
  }),

  // Create company
  http.post(`${API_BASE_URL}/v1/companies`, async ({ request }) => {
    if (config.delay) {
      await delay(config.delay);
    }

    const body = (await request.json()) as any;

    const newCompany: any = {
      id: nextCompanyId++,
      ...body,
      status: body.status || "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCompanies.push(newCompany);

    return HttpResponse.json(newCompany, { status: 201 });
  }),

  // Update company
  http.put(`${API_BASE_URL}/v1/companies/:id`, async ({ params, request }) => {
    if (config.delay) {
      await delay(config.delay);
    }

    const { id } = params;
    const companyId = parseInt(id as string, 10);
    const body = (await request.json()) as any;

    const index = mockCompanies.findIndex((c) => c.id === companyId);

    if (index === -1) {
      return HttpResponse.json(
        {
          error: "Company not found",
          message: `Company with ID ${id} does not exist`,
        },
        { status: 404 },
      );
    }

    mockCompanies[index] = {
      ...mockCompanies[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(mockCompanies[index]);
  }),

  // Delete company
  http.delete(`${API_BASE_URL}/v1/companies/:id`, async ({ params }) => {
    if (config.delay) {
      await delay(config.delay);
    }

    const { id } = params;
    const companyId = parseInt(id as string, 10);
    const index = mockCompanies.findIndex((c) => c.id === companyId);

    if (index === -1) {
      return HttpResponse.json(
        {
          error: "Company not found",
          message: `Company with ID ${id} does not exist`,
        },
        { status: 404 },
      );
    }

    mockCompanies.splice(index, 1);

    return HttpResponse.json(null, { status: 204 });
  }),
];
