// API configuration and helper functions for the Globassets backend

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL

/**
 * Maps property types between API response format and URL endpoint format
 * API returns: "HouseForRent", "HouseForSale", "Flatshare", "Land", "Shop"
 * Endpoints need: "houses-for-rent", "houses-for-sale", "flatshares", "lands", "shops"
 */
export const propertyTypeToSlug = (propertyType: string): string => {
  const typeMap: Record<string, string> = {
    'HouseForRent': 'houses-for-rent',
    'HouseForSale': 'houses-for-sale',
    'Flatshare': 'flatshares',
    'Land': 'lands',
    'Shop': 'shops',
    // Handle various formats
    'house-for-rent': 'houses-for-rent',
    'house-for-sale': 'houses-for-sale',
    'flatshare': 'flatshares',
    'land': 'lands',
    'shop': 'shops',
  };
  
  return typeMap[propertyType] || propertyType.toLowerCase().replace(/\s+/g, '-');
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  first_name: string;
  last_name?: string;
  password: string;
  role: 'personal' | 'company';
}

interface LoginResponse {
  access: string;
  refresh: string;
  email: string;
  role: string;
}

interface ApiError {
  detail?: string;
  message?: string;
}

// Helper function to get auth headers
export const getAuthHeaders = (): Record<string, string> => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return {};
  }
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API functions
export const api = {
  // Authentication
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auths/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data: LoginResponse = await response.json();
    
    // Store tokens
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user_email', data.email);
    localStorage.setItem('user_role', data.role);
    
    return data;
  },

  register: async (data: RegisterData): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auths/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/auths/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
  },

  refreshToken: async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auths/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    
    return data.access;
  },

  // File upload
  generatePresignedUrl: async (files: Array<{ file_name: string; file_type?: string }>, folderName?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/generate_presigned_url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        files,
        folder_name: folderName,
      }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail || 'Failed to generate upload URL');
    }

    return await response.json();
  },

  uploadToR2: async (presignedUrl: string, file: File) => {
    console.log('🔵 [R2 Upload] Starting upload to R2');
    console.log('🔵 [R2 Upload] Presigned URL:', presignedUrl);
    console.log('🔵 [R2 Upload] File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    });

    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      console.log('🔵 [R2 Upload] Response status:', response.status);
      console.log('🔵 [R2 Upload] Response OK:', response.ok);
      console.log('🔵 [R2 Upload] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const responseText = await response.text();
        console.error('🔴 [R2 Upload] Upload failed!');
        console.error('🔴 [R2 Upload] Response text:', responseText);
        throw new Error(`Failed to upload file to R2: ${response.status} ${response.statusText}`);
      }

      console.log('✅ [R2 Upload] Upload successful!');
    } catch (error) {
      console.error('🔴 [R2 Upload] Exception during upload:', error);
      throw error;
    }
  },

  // Save profile image key to backend after R2 upload
  saveProfileImage: async (key: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/save-profile-image/?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail || 'Failed to save profile image');
    }

    return await response.json();
  },

  // Properties
  getMyProperties: async (propertyType?: string) => {
    const endpoint = propertyType 
      ? `${API_BASE_URL}/api/v1/properties/${propertyType}/mine/`
      : `${API_BASE_URL}/api/v1/properties/browse/mine/`;
    
    const response = await fetch(endpoint, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }

    return await response.json();
  },

  getAllProperties: async (queryString?: string) => {
    const url = queryString 
      ? `${API_BASE_URL}/api/v1/properties/browse/${queryString}`
      : `${API_BASE_URL}/api/v1/properties/browse/`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }

    return await response.json();
  },

  getPropertyById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/browse/${id}/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch property');
    }

    const data = await response.json();
  console.log('🔍 API Response from getPropertyById:', data);  // ← ADD THIS LINE
  console.log('🔍 property_type field:', data.property_type);
    return data;
    // return await response.json();
  },

  createProperty: async (propertyType: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/${propertyType}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail || 'Failed to create property');
    }

    return await response.json();
  },

  createPropertyImage: async (propertyId: string, key: string, isCover: boolean = false) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/property-images/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        property_obj: propertyId,
        key,
        is_cover: isCover,
      }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail || 'Failed to create property image');
    }

    return await response.json();
  },

  getPropertyImage: async (imageId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/property-images/${imageId}/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch property image');
    }

    return await response.json();
  },

  deletePropertyImage: async (imageId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/property-images/${imageId}/`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete property image');
    }
  },

  // Get properties by owner (realtor)
  getPropertiesByOwner: async (ownerUsername: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/browse/?owner=${ownerUsername}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch properties by owner');
    }

    return await response.json();
  },

  updateProperty: async (propertyType: string, id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/${propertyType}/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail || 'Failed to update property');
    }

    return await response.json();
  },

  deleteProperty: async (propertyType: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/${propertyType}/${id}/`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete property');
    }
  },

  // Location data
  getStates: async (search?: string) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/states/${params}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch states');
    }

    return await response.json();
  },

  getRegions: async (stateId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/regions/?state_id=${stateId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch regions');
    }

    return await response.json();
  },

  createRegion: async (stateId: string, regionName: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/states/${stateId}/regions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ name: regionName }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail || 'Failed to create region');
    }

    return await response.json();
  },

  // Property features
  getPropertyFeatures: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/property-features`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch property features');
    }

    return await response.json();
  },

  // Room types (fetch from server instead of using frontend static copy)
  getRoomTypes: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/room-types/`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch room types');
    }

    return await response.json();
  },

  // dashboard overview
  getDashboardOverview: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/dashboard-overview`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard overview');
    }

    return await response.json();
  },

  // Personal Profile
  getPersonalProfile: async (id?: string) => {
    const endpoint = id 
      ? `${API_BASE_URL}/api/v1/users/personal-profile/${id}/`
      : `${API_BASE_URL}/api/v1/users/personal-profile/`;
    
    const response = await fetch(endpoint, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch personal profile');
    }

    const data = await response.json();
    return id ? data : data[0]; // Return first profile for current user
  },

  updatePersonalProfile: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/personal-profile/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail || 'Failed to update personal profile');
    }

    return await response.json();
  },

  createPersonalProfile: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/personal-profile/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail || 'Failed to create personal profile');
    }

    return await response.json();
  },

  // Company Profile
  getCompanyProfile: async (id?: string) => {
    const endpoint = id 
      ? `${API_BASE_URL}/api/v1/users/company-profile/${id}/`
      : `${API_BASE_URL}/api/v1/users/company-profile/`;
    
    const response = await fetch(endpoint, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company profile');
    }

    const data = await response.json();
    return id ? data : data[0]; // Return first profile for current user
  },

  updateCompanyProfile: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/company-profile/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail || 'Failed to update company profile');
    }

    return await response.json();
  },

  createCompanyProfile: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/company-profile/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail || 'Failed to create company profile');
    }

    return await response.json();
  },

  // Public Profile View (unified endpoint for both personal and company)
  getPublicProfile: async (username: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/public-profile/${username}/`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch public profile');
    }

    return await response.json();
  },

  // Admin Endpoints
  getAdminDashboardOverview: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/custom_admin/admin-dashboard-overview/`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch admin dashboard overview');
    }

    return await response.json();
  },

  getUserDashboard: async (profileType?: string, emailSearch?: string, page: number = 1, pageSize: number = 20) => {
    const params = new URLSearchParams();
    if (profileType && profileType !== 'all') params.append('role', profileType);
    if (emailSearch) params.append('email', emailSearch);
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    const response = await fetch(`${API_BASE_URL}/api/v1/custom_admin/user-dashboard/?${params.toString()}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user dashboard');
    }

    return await response.json();
  },

  getAllPersonalProfiles: async (stateId?: string) => {
    const params = stateId ? `?state=${stateId}` : '';
    const response = await fetch(`${API_BASE_URL}/api/v1/users/personal-profile/${params}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch personal profiles');
    }

    return await response.json();
  },

  getAllCompanyProfiles: async (stateId?: string) => {
    const params = stateId ? `?state=${stateId}` : '';
    const response = await fetch(`${API_BASE_URL}/api/v1/users/company-profile/${params}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company profiles');
    }

    return await response.json();
  },

  browseProperties: async (queryParams: string = '') => {
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/browse/?${queryParams}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to browse properties');
    }

    return await response.json();
  },

  togglePropertyActive: async (id: string, isActive: boolean) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/properties/browse/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ is_active: isActive }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle property active status');
    }

    return await response.json();
  },

togglePropertyVerified: async (id: string, isVerified: boolean) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/properties/browse/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ is_verified: isVerified }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to toggle property verified status");
  }

  return response.json();
}
};
