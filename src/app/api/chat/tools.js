/**
 * Sahal Agent Tools — "The Hands"
 * Defines Groq Function Calling schemas + executor functions.
 * Each tool has a schema (sent to the LLM) and an execute() (runs server-side).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Tool Schemas (sent to Groq) ────────────────────────────────────────────────
export const TOOL_SCHEMAS = [
    {
        type: 'function',
        function: {
            name: 'check_my_jobs',
            description: 'Fetch the current user\'s active and recent jobs/tasks from the SahulatHub database. Use this when the user asks about their job status, active bookings, or tracking.',
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'book_service',
            description: 'Create a new service booking for the user. Use this when the user wants to book a service (plumbing, electrical, AC repair, cleaning, painting, carpentry).',
            parameters: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: 'A clear, specific title for the job (e.g., "Fix leaking kitchen tap")',
                    },
                    description: {
                        type: 'string',
                        description: 'Detailed description of the issue extracted from the conversation',
                    },
                    category: {
                        type: 'string',
                        enum: ['plumbing', 'electrical', 'ac_repair', 'cleaning', 'painting', 'carpentry'],
                        description: 'The service category',
                    },
                    urgency: {
                        type: 'string',
                        enum: ['normal', 'high', 'critical'],
                        description: 'Urgency level. Use "critical" only for active damage (flooding, sparks, etc.)',
                    },
                },
                required: ['title', 'description', 'category', 'urgency'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_job_details',
            description: 'Get the full details of a specific job/task by its ID. Use this when the user provides a job ID or asks for specific job information.',
            parameters: {
                type: 'object',
                properties: {
                    job_id: {
                        type: 'string',
                        description: 'The MongoDB ID of the task/job',
                    },
                },
                required: ['job_id'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'cancel_job',
            description: 'Cancel an open or assigned job. Only do this if the user explicitly confirms they want to cancel.',
            parameters: {
                type: 'object',
                properties: {
                    job_id: {
                        type: 'string',
                        description: 'The MongoDB ID of the task to cancel',
                    },
                },
                required: ['job_id'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'navigate_user',
            description: 'Navigate or redirect the user to a specific page on SahulatHub (e.g. /contact, /client/dashboard, /auth/login, /help). Use this when the user asks to be taken to a page.',
            parameters: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'The relative URL to redirect to, starting with /' }
                },
                required: ['url']
            }
        }
    }
];

// ── Tool Executors (server-side DB calls) ──────────────────────────────────────
export async function executeTool(toolName, toolArgs, authToken) {
    const headers = {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };

    switch (toolName) {
        case 'check_my_jobs': {
            try {
                const res = await fetch(`${API_BASE}/api/tasks/my`, { headers });
                if (!res.ok) return { error: 'Could not fetch jobs. User may not be logged in.' };
                const data = await res.json();
                const jobs = (data.data || []).slice(0, 5).map(t => ({
                    id: t._id,
                    title: t.title,
                    category: t.category,
                    status: t.status,
                    urgency: t.urgency,
                    payment_status: t.payment_status,
                    worker: t.assigned_worker_id?.name || 'Not yet assigned',
                    created: new Date(t.createdAt).toLocaleDateString('en-PK'),
                }));
                return { jobs, total: data.count || jobs.length };
            } catch (e) {
                return { error: e.message };
            }
        }

        case 'book_service': {
            try {
                // We use a placeholder location since Sahal doesn't have GPS
                const body = {
                    title: toolArgs.title,
                    description: toolArgs.description,
                    category: toolArgs.category,
                    urgency: toolArgs.urgency || 'normal',
                    location: { lat: 31.5204, lng: 74.3587 }, // Default Lahore coords
                    radius: 25,
                };
                const res = await fetch(`${API_BASE}/api/tasks`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(body),
                });
                if (!res.ok) {
                    const err = await res.json();
                    return { error: err.message || 'Booking failed. Make sure you are logged in as a client.' };
                }
                const data = await res.json();
                return {
                    success: true,
                    job_id: data.data._id,
                    title: data.data.title,
                    status: data.data.status,
                    tracking_url: `/client/job/${data.data._id}`,
                    message: 'Task created successfully',
                };
            } catch (e) {
                return { error: e.message };
            }
        }

        case 'get_job_details': {
            try {
                const res = await fetch(`${API_BASE}/api/tasks/${toolArgs.job_id}`, { headers });
                if (!res.ok) return { error: 'Job not found or access denied.' };
                const data = await res.json();
                const t = data.data;
                return {
                    id: t._id,
                    title: t.title,
                    description: t.description,
                    status: t.status,
                    urgency: t.urgency,
                    payment_status: t.payment_status,
                    budget: t.budget,
                    worker: t.assigned_worker_id ? {
                        name: t.assigned_worker_id.name,
                        phone: t.assigned_worker_id.phone,
                        rating: t.assigned_worker_id.rating,
                    } : null,
                    tracking_url: `/client/job/${t._id}`,
                };
            } catch (e) {
                return { error: e.message };
            }
        }

        case 'cancel_job': {
            try {
                const res = await fetch(`${API_BASE}/api/tasks/${toolArgs.job_id}/status`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ status: 'cancelled' }),
                });
                if (!res.ok) return { error: 'Cancellation failed. The job may already be in progress.' };
                return { success: true, message: 'Job has been successfully cancelled.' };
            } catch (e) {
                return { error: e.message };
            }
        }

        case 'navigate_user': {
            // The actual redirect happens in the frontend via route.js action
            return { success: true, message: `Navigating user to ${toolArgs.url}` };
        }

        default:
            return { error: `Unknown tool: ${toolName}` };
    }
}
