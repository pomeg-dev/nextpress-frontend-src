import { google, analyticsdata_v1beta } from "googleapis";
import { ExternalAccountClientOptions, GoogleAuth } from "google-auth-library";

const SERVICE_ACCOUNT = process.env.GA_SERVICE_ACCOUNT;

//ga sercide account same for all preoperties at the moment (arestinprofessional.com & arestin.com)
const credentials: ExternalAccountClientOptions = SERVICE_ACCOUNT 
  ? JSON.parse(SERVICE_ACCOUNT) 
  : undefined;

export interface RequestBody {
  dateRanges: Array<{
    startDate: string;
    endDate: string;
  }>;
  dimensions: Array<{
    name: string;
  }>;
  metrics: Array<{
    name: string;
  }>;
  [dimensionFilter: string]: {[filter: string]: any};
}

interface ReportRow {
  dimensions: string[];
  metrics: string[];
}

export async function getGA4Report(
  requestBody: RequestBody,
  propertyId: string
): Promise<ReportRow[]> {
  try {
    // Authorize a client with the service account
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: "https://www.googleapis.com/auth/analytics.readonly",
    });

    const analytics = google.analyticsdata({
      version: "v1beta",
      auth: auth,
    });

    // Add property ID to the request body
    const request: analyticsdata_v1beta.Schema$RunReportRequest = {
      property: `properties/${propertyId}`,
      ...requestBody,
    };
    // Fetch the report
    const response = await analytics.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: request,
    });

    // Process the data
    const reports: ReportRow[] =
      response.data.rows?.map((row) => {
        const dimensions =
          row.dimensionValues
            ?.map((dimension) => dimension.value)
            .filter(
              (value): value is string => value !== null && value !== undefined
            ) || [];
        const metrics =
          row.metricValues
            ?.map((metric) => metric.value)
            .filter(
              (value): value is string => value !== null && value !== undefined
            ) || [];
        return { dimensions, metrics };
      }) || [];
    return reports;
  } catch (error) {
    console.error("Error fetching GA4 report:", error);
    // Return an empty array in case of error
    return [];
  }
}
