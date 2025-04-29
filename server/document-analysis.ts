import axios from 'axios';

// Check if Azure Document Intelligence key exists
const hasDocumentAnalysisKey = !!process.env.AZURE_DOCUMENT_ANALYSIS_KEY;
const hasDocumentAnalysisEndpoint = !!process.env.AZURE_DOCUMENT_ANALYSIS_ENDPOINT;

// Function to analyze VA documents using Azure Document Intelligence API
export async function analyzeVADocument(documentUrl: string, documentType: string = 'prebuilt-document') {
  // Return basic analysis if API credentials are missing
  if (!hasDocumentAnalysisKey || !hasDocumentAnalysisEndpoint) {
    console.warn('Azure Document Analysis credentials missing - returning basic analysis');
    return {
      status: 'Simulated Analysis',
      documentType: documentType,
      content: 'Azure Document Intelligence API key required for actual document analysis',
      fields: {},
      message: 'Add Azure Document Intelligence API credentials for full document analysis capabilities'
    };
  }
  
  try {
    // First, initiate document analysis
    const operationLocation = await startDocumentAnalysis(documentUrl, documentType);
    
    // Poll for results until the operation completes
    let result = await getOperationResult(operationLocation);
    let status = result.status;
    
    // Keep polling until done
    while (status !== 'succeeded' && status !== 'failed') {
      // Wait for a short interval before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await getOperationResult(operationLocation);
      status = result.status;
    }
    
    if (status === 'failed') {
      throw new Error('Document analysis operation failed');
    }
    
    return result.analyzeResult;
  } catch (error: any) {
    console.error('Error analyzing document:', error.message);
    throw new Error(`Document analysis failed: ${error.message}`);
  }
}

// Start document analysis operation
async function startDocumentAnalysis(documentUrl: string, modelId: string) {
  try {
    const response = await axios.post(
      `${process.env.AZURE_DOCUMENT_ANALYSIS_ENDPOINT}/formrecognizer/documentModels/${modelId}:analyze?api-version=2023-07-31`,
      {
        urlSource: documentUrl
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': process.env.AZURE_DOCUMENT_ANALYSIS_KEY
        }
      }
    );
    
    // Get the operation-location header for polling
    return response.headers['operation-location'];
  } catch (error: any) {
    console.error('Error starting document analysis:', error.message);
    throw new Error('Failed to start document analysis');
  }
}

// Get operation result
async function getOperationResult(operationLocation: string) {
  try {
    const response = await axios.get(operationLocation, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_DOCUMENT_ANALYSIS_KEY
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error getting operation result:', error.message);
    throw new Error('Failed to get document analysis result');
  }
}

// Specialized function to extract VA claim information from documents
export async function extractVAClaimInfo(documentUrl: string) {
  const result = await analyzeVADocument(documentUrl, 'prebuilt-document');
  
  // Placeholder for VA claim information extraction logic
  // This would be more sophisticated in production, using custom models
  let claimInfo = {
    claimNumber: findClaimNumber(result),
    veteranName: findVeteranName(result),
    serviceConnected: findServiceConnection(result),
    dispositions: findDispositions(result),
    effectiveDate: findEffectiveDate(result),
    raw: result
  };
  
  return claimInfo;
}

// Helper functions to extract specific information from VA documents
// These would be more sophisticated in a production environment

function findClaimNumber(documentResult: any): string {
  // In actual implementation, this would use regex patterns or field extraction
  // to find claim numbers in VA documents
  if (!hasDocumentAnalysisKey) {
    return 'API-KEY-REQUIRED-FOR-EXTRACTION';
  }
  
  try {
    // Search for claim number in document content or fields
    // This is a simplified implementation
    const content = documentResult.content || '';
    const claimNumberMatch = content.match(/Claim #: (\d+)/i) || 
                             content.match(/Claim Number: (\d+)/i) ||
                             content.match(/C-file Number: (\d+)/i);
    
    return claimNumberMatch ? claimNumberMatch[1] : 'Not found';
  } catch (error) {
    console.error('Error finding claim number:', error);
    return 'Error extracting claim number';
  }
}

function findVeteranName(documentResult: any): string {
  if (!hasDocumentAnalysisKey) {
    return 'API-KEY-REQUIRED-FOR-EXTRACTION';
  }
  
  try {
    const content = documentResult.content || '';
    // Look for veteran name patterns
    const nameMatch = content.match(/Veteran Name: ([A-Za-z\s]+)/i) ||
                      content.match(/Name: ([A-Za-z\s]+), Veteran/i);
    
    return nameMatch ? nameMatch[1].trim() : 'Not found';
  } catch (error) {
    console.error('Error finding veteran name:', error);
    return 'Error extracting veteran name';
  }
}

function findServiceConnection(documentResult: any): boolean {
  if (!hasDocumentAnalysisKey) {
    return false;
  }
  
  try {
    const content = documentResult.content || '';
    // Check for service-connected indicators
    return content.includes('Service-Connected') || 
           content.includes('Service Connected') ||
           content.includes('SC:') ||
           content.includes('S/C');
  } catch (error) {
    console.error('Error determining service connection:', error);
    return false;
  }
}

function findDispositions(documentResult: any): string[] {
  if (!hasDocumentAnalysisKey) {
    return ['API-KEY-REQUIRED-FOR-EXTRACTION'];
  }
  
  try {
    const content = documentResult.content || '';
    const dispositions: string[] = [];
    
    // Look for common disposition patterns in VA documents
    const lines = content.split('\n');
    let inDispositionSection = false;
    
    for (const line of lines) {
      if (line.includes('DISPOSITION') || line.includes('Decision:')) {
        inDispositionSection = true;
        continue;
      }
      
      if (inDispositionSection && line.trim() && !line.includes('Page') && !line.includes('Date')) {
        dispositions.push(line.trim());
      }
      
      // Exit disposition section if we hit another header
      if (inDispositionSection && (line.includes('EVIDENCE') || line.includes('REASONS'))) {
        inDispositionSection = false;
      }
    }
    
    return dispositions.length > 0 ? dispositions : ['Not found'];
  } catch (error) {
    console.error('Error finding dispositions:', error);
    return ['Error extracting dispositions'];
  }
}

function findEffectiveDate(documentResult: any): string {
  if (!hasDocumentAnalysisKey) {
    return 'API-KEY-REQUIRED-FOR-EXTRACTION';
  }
  
  try {
    const content = documentResult.content || '';
    // Look for effective date patterns
    const dateMatch = content.match(/Effective Date: (\d{2}\/\d{2}\/\d{4})/i) ||
                      content.match(/Effective: (\d{2}\/\d{2}\/\d{4})/i) ||
                      content.match(/Effective Date: ([A-Za-z]+ \d{1,2}, \d{4})/i);
    
    return dateMatch ? dateMatch[1] : 'Not found';
  } catch (error) {
    console.error('Error finding effective date:', error);
    return 'Error extracting effective date';
  }
}