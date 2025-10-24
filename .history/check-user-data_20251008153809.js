// Script to check the current logged in user data from localStorage
function checkUserData() {
  const storedUser = localStorage.getItem('mapit_user');
  const isLoggedIn = localStorage.getItem('mapit_logged_in') === 'true';

  if (storedUser && isLoggedIn) {
    try {
      const userData = JSON.parse(storedUser);
      console.log('=== Current User Data ===');
      console.log('User is logged in:', isLoggedIn);
      console.log('User data:', userData);
      
      if (!userData.customer_id) {
        console.error('⚠️ WARNING: customer_id is missing from user data!');
      }
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
    }
  } else {
    console.log('No user is currently logged in.');
  }
}

// Run the check
checkUserData();