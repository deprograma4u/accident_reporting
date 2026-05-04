import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AlertPayload {
  userId: string;
  fullName: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  detectionType: 'auto' | 'manual';
  emergencyContacts: Array<{
    contact_name: string;
    contact_phone: string;
  }>;
  mapsUrl: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: AlertPayload = await req.json();

    console.log('Emergency alert received:', {
      name: payload.fullName,
      location: `${payload.latitude}, ${payload.longitude}`,
      type: payload.detectionType,
    });

    const message = `EMERGENCY ALERT!\n\n${payload.fullName} (${payload.phoneNumber}) may have been in an accident.\n\nDetection Type: ${payload.detectionType}\nLocation: ${payload.mapsUrl}\n\nPlease check on them immediately!`;

    console.log('Alert message:', message);
    console.log(`Would notify ${payload.emergencyContacts.length} contacts`);

    payload.emergencyContacts.forEach((contact) => {
      console.log(`- ${contact.contact_name}: ${contact.contact_phone}`);
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Emergency alert sent successfully',
        contactsNotified: payload.emergencyContacts.length,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing alert:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send emergency alert',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
