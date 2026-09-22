interface ContactFormData {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
}

interface ValidationError {
  field: string;
  message: string;
}

interface SuccessResponse {
  success: true;
  message: string;
  timestamp: string;
}

interface ErrorResponse {
  success: false;
  errors: ValidationError[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate(data: ContactFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.nombre || data.nombre.trim().length === 0) {
    errors.push({ field: "nombre", message: "El nombre es obligatorio." });
  } else if (data.nombre.trim().length > 100) {
    errors.push({ field: "nombre", message: "El nombre no debe exceder 100 caracteres." });
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: "email", message: "El correo electronico es obligatorio." });
  } else if (data.email.trim().length > 200) {
    errors.push({ field: "email", message: "El correo electronico no debe exceder 200 caracteres." });
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.push({ field: "email", message: "El formato del correo electronico no es valido." });
  }

  if (data.telefono && data.telefono.trim().length > 20) {
    errors.push({ field: "telefono", message: "El telefono no debe exceder 20 caracteres." });
  }

  if (!data.mensaje || data.mensaje.trim().length === 0) {
    errors.push({ field: "mensaje", message: "El mensaje es obligatorio." });
  } else if (data.mensaje.trim().length > 1000) {
    errors.push({ field: "mensaje", message: "El mensaje no debe exceder 1000 caracteres." });
  }

  return errors;
}

export const onRequestPost: PagesFunction = async ({ request }) => {
  let body: Record<string, string>;

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries()) as Record<string, string>;
    }
  } catch {
    return new Response(
      JSON.stringify({ success: false, errors: [{ field: "body", message: "Cuerpo de solicitud invalido." }] }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Honeypot — silently accept but don't process
  if (body.website && body.website.trim().length > 0) {
    return new Response(
      JSON.stringify({ success: true, message: "Gracias por tu mensaje. Te contactaremos pronto." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const data: ContactFormData = {
    nombre: body.nombre ?? "",
    email: body.email ?? "",
    telefono: body.telefono,
    mensaje: body.mensaje ?? "",
  };

  const errors = validate(data);

  if (errors.length > 0) {
    return new Response(JSON.stringify({ success: false, errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(`[Contacto] ${new Date().toISOString()} — ${data.nombre} <${data.email}>${data.telefono ? ` — Tel: ${data.telefono}` : ""}`);

  const response: SuccessResponse = {
    success: true,
    message: "Gracias por tu mensaje. Te contactaremos pronto.",
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, errors: [{ field: "method", message: "Metodo no permitido." }] }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }
  return onRequestPost(context);
};
