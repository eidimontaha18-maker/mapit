import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AppNavBar from '../components/AppNavBar';

interface Package {
  package_id: number;
  name: string;
  price: string;
  allowed_maps: number;
  priority: number;
}

interface CustomerPackage {
  name: string;
  price: string;
  allowed_maps: number;
  priority: number;
}

const UpgradePage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [customerPackage, setCustomerPackage] = useState<CustomerPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch available packages
    fetch('/api/packages')
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          throw new Error('Failed to fetch packages');
        }
        return JSON.parse(text);
      })
      .then((data) => {
        if (data.success) {
          setPackages(data.packages);
        }
      })
      .catch((error) => {
        console.error('Error fetching packages:', error);
      });

    // Fetch customer's current package
    if (user?.customer_id) {
      fetch(`/api/customer/${user.customer_id}/package`)
        .then(async (res) => {
          const text = await res.text();
          if (!res.ok) {
            return null;
          }
          return JSON.parse(text);
        })
        .then((data) => {
          if (data?.success && data?.package) {
            setCustomerPackage({
              name: data.package.name,
              price: data.package.price,
              allowed_maps: data.package.allowed_maps,
              priority: data.package.priority
            });
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching customer package:', error);
          setLoading(false);
        });
    }
  }, [user?.customer_id]);

  const handleUpgrade = (pkg: Package) => {
    // This would integrate with a payment system
    alert(`Upgrading to ${pkg.name.toUpperCase()} plan ($${parseFloat(pkg.price).toFixed(2)}/month) - Payment integration coming soon!`);
  };

  return (
    <>
      <AppNavBar />
      <div style={{
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '100px',
        minHeight: '100vh',
        background: '#ffffff'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '12px'
          }}>
            Upgrade Your Plan
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#718096',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Choose the perfect plan for your mapping needs
          </p>
        </div>

        {customerPackage && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            border: '2px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>Current Plan</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
              {customerPackage.name.toUpperCase()} - ${parseFloat(customerPackage.price).toFixed(2)}/month
            </div>
            <div style={{ fontSize: '14px', color: '#4a5568', marginTop: '4px' }}>
              {customerPackage.allowed_maps} {customerPackage.allowed_maps === 1 ? 'map' : 'maps'} allowed
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            Loading packages...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {packages.map((pkg) => {
              const isCurrentPlan = customerPackage?.name === pkg.name;
              const isUpgrade = customerPackage ? pkg.priority > customerPackage.priority : false;
              const price = parseFloat(pkg.price);

              return (
                <div
                  key={pkg.package_id}
                  style={{
                    border: isUpgrade ? '3px solid #667eea' : '2px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '32px',
                    background: isUpgrade 
                      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                      : 'white',
                    position: 'relative',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: isCurrentPlan ? 'default' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrentPlan) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {isUpgrade && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '24px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                    }}>
                      Recommended
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '24px',
                      background: '#48bb78',
                      color: 'white',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'uppercase'
                    }}>
                      Current Plan
                    </div>
                  )}

                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '12px',
                    textTransform: 'uppercase'
                  }}>
                    {pkg.name}
                  </div>

                  <div style={{
                    fontSize: '48px',
                    fontWeight: '700',
                    color: '#667eea',
                    marginBottom: '8px'
                  }}>
                    ${price.toFixed(0)}
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '500',
                      color: '#718096'
                    }}>
                      {price === 0 ? '/forever' : '/month'}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '16px',
                    color: '#4a5568',
                    marginBottom: '32px',
                    paddingBottom: '24px',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    Create up to <strong>{pkg.allowed_maps}</strong> {pkg.allowed_maps === 1 ? 'map' : 'maps'}
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#48bb78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span style={{ fontSize: '14px', color: '#4a5568' }}>Draw custom zones</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#48bb78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span style={{ fontSize: '14px', color: '#4a5568' }}>Multiple map views</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#48bb78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span style={{ fontSize: '14px', color: '#4a5568' }}>Save & export maps</span>
                    </div>
                  </div>

                  <button
                    onClick={() => !isCurrentPlan && handleUpgrade(pkg)}
                    disabled={isCurrentPlan}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: isCurrentPlan 
                        ? '#e2e8f0' 
                        : isUpgrade 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : '#4f8cff',
                      color: isCurrentPlan ? '#718096' : 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: isCurrentPlan ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isCurrentPlan ? 'none' : '0 4px 12px rgba(79, 140, 255, 0.3)'
                    }}
                  >
                    {isCurrentPlan ? 'Current Plan' : isUpgrade ? 'Upgrade Now' : 'Select Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div style={{
          textAlign: 'center',
          padding: '32px',
          background: '#f7fafc',
          borderRadius: '12px',
          marginBottom: '40px'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 24px',
              background: '#e2e8f0',
              color: '#4a5568',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
};

export default UpgradePage;
