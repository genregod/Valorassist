import axios from 'axios';

// Check if VA API keys exist
const hasBenefitsApiKey = !!process.env.VA_BENEFITS_API_KEY;
const hasHealthApiKey = !!process.env.VA_HEALTH_API_KEY;
const hasVerificationApiKey = !!process.env.VA_VERIFICATION_API_KEY;

// Base URLs for VA APIs (sandbox environments)
const BENEFITS_API_URL = 'https://sandbox-api.va.gov/services/benefits/v1';
const HEALTH_API_URL = 'https://sandbox-api.va.gov/services/fhir/v0/r4';
const VERIFICATION_API_URL = 'https://sandbox-api.va.gov/services/veteran_verification/v1';

// Benefits API - Get claim status
export async function getClaimStatus(claimId: string, ssn: string) {
  // Return placeholder data if API key is missing
  if (!hasBenefitsApiKey) {
    console.warn('VA Benefits API key missing - returning placeholder data');
    return {
      id: claimId,
      status: 'PENDING',
      updatedAt: new Date().toISOString(),
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'DISABILITY COMPENSATION',
      message: 'VA API key required for live claim status'
    };
  }
  
  try {
    const response = await axios.get(`${BENEFITS_API_URL}/claims/${claimId}`, {
      headers: {
        'apiKey': process.env.VA_BENEFITS_API_KEY,
        'X-VA-SSN': ssn,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching claim status:', error.message);
    throw new Error('Failed to retrieve claim status from VA API');
  }
}

// Health API - Get patient records
export async function getPatientRecords(icn: string) {
  // Return placeholder data if API key is missing
  if (!hasHealthApiKey) {
    console.warn('VA Health API key missing - returning placeholder data');
    return {
      resourceType: 'Patient',
      id: icn,
      meta: {
        lastUpdated: new Date().toISOString()
      },
      name: [{ text: 'API key required for actual patient data' }],
      message: 'VA Health API key required for live patient records'
    };
  }
  
  try {
    const response = await axios.get(`${HEALTH_API_URL}/Patient/${icn}`, {
      headers: {
        'apiKey': process.env.VA_HEALTH_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching patient records:', error.message);
    throw new Error('Failed to retrieve patient records from VA API');
  }
}

// Verification API - Verify veteran status
export async function verifyVeteranStatus(ssn: string, firstName: string, lastName: string, birthDate: string) {
  // Return placeholder data if API key is missing
  if (!hasVerificationApiKey) {
    console.warn('VA Verification API key missing - returning placeholder data');
    return {
      status: 'CONFIRMED',
      isVeteran: true,
      branchOfService: 'Sample Branch',
      verifiedAt: new Date().toISOString(),
      message: 'VA Verification API key required for actual verification'
    };
  }
  
  try {
    const response = await axios.post(`${VERIFICATION_API_URL}/status`, {
      ssn,
      firstName,
      lastName,
      birthDate
    }, {
      headers: {
        'apiKey': process.env.VA_VERIFICATION_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error verifying veteran status:', error.message);
    throw new Error('Failed to verify veteran status with VA API');
  }
}

// Get VA facility information
export async function getFacilityInfo(facilityId: string) {
  try {
    // This endpoint doesn't require authentication
    const response = await axios.get(`https://sandbox-api.va.gov/services/va_facilities/v1/facilities/${facilityId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching facility information:', error.message);
    throw new Error('Failed to retrieve facility information from VA API');
  }
}

// Search VA facilities by location
export async function searchFacilities(lat: number, long: number, radius: number = 50) {
  try {
    // This endpoint doesn't require authentication
    const response = await axios.get(`https://sandbox-api.va.gov/services/va_facilities/v1/facilities`, {
      params: {
        lat,
        long,
        radius
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error searching facilities:', error.message);
    throw new Error('Failed to search facilities with VA API');
  }
}

// Get educational benefits information
export async function getEducationBenefits(fileNumber: string) {
  // Return placeholder data if API key is missing
  if (!hasBenefitsApiKey) {
    console.warn('VA Benefits API key missing - returning placeholder data');
    return {
      chapter33: {
        eligibleForBenefits: true,
        remainingEntitlement: '36 months',
        delimiting_date: '2030-01-01'
      },
      message: 'VA API key required for live education benefits data'
    };
  }
  
  try {
    const response = await axios.get(`${BENEFITS_API_URL}/education/${fileNumber}`, {
      headers: {
        'apiKey': process.env.VA_BENEFITS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching education benefits:', error.message);
    throw new Error('Failed to retrieve education benefits from VA API');
  }
}