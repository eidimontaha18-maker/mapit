import React, { useEffect, useState } from 'react';import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';import { useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';import              }}

import NewMapForm from '../components/NewMapForm';              onMouseOver={(e) => {

                e.currentTarget.style.background = '#3a7dff';

export interface MapRecord {                e.currentTarget.style.boxShadow = '0 6px 16px rgba(79,140,255,0.3)';

  map_id: number;              }}

  title: string;              onMouseOut={(e) => {

  description?: string;                e.currentTarget.style.background = '#4f8cff';

  created_at?: string;                e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,140,255,0.2)';

  active?: boolean;              }}

  country?: string;            > } from '../hooks/useAuth';

}import NewMapForm from '../components/NewMapForm';



const DashboardPage: React.FC = () => {export interface MapRecord {

  const [maps, setMaps] = useState<MapRecord[]>([]);  map_id: number;

  const [loading, setLoading] = useState(true);  title: string;

  const [showNewMapForm, setShowNewMapForm] = useState(false);  description?: string;

  const navigate = useNavigate();  created_at?: string;

  const { user } = useAuth();  active?: boolean;

  country?: string;

  useEffect(() => {}

    // Add logging to debug API call

    console.log('Fetching maps from API...');const DashboardPage: React.FC = () => {

      const [maps, setMaps] = useState<MapRecord[]>([]);

    // Only fetch maps if user is logged in  const [loading, setLoading] = useState(true);

    if (!user?.customer_id) {  const [showNewMapForm, setShowNewMapForm] = useState(false);

      setMaps([]);  const navigate = useNavigate();

      setLoading(false);  const { user } = useAuth();

      return;

    }  useEffect(() => {

        // Add logging to debug API call

    // Update to use PostgREST format with filter by customer_id    console.log('Fetching maps from API...');

    fetch(`/map?customer_id=eq.${user.customer_id}`)    

      .then((res) => {    // Only fetch maps if user is logged in

        console.log('API response status:', res.status);    if (!user?.customer_id) {

        return res.json();      setMaps([]);

      })      setLoading(false);

      .then((data) => {      return;

        console.log('API response data:', data);    }

        setMaps(data.records || []);    

        setLoading(false);    // Update to use PostgREST format with filter by customer_id

      })    fetch(`/map?customer_id=eq.${user.customer_id}`)

      .catch(error => {      .then((res) => {

        console.error('Error fetching maps:', error);        console.log('API response status:', res.status);

        setLoading(false);        return res.json();

      });      })

  }, [user?.customer_id]);      .then((data) => {

        console.log('API response data:', data);

  const handleView = (id: number) => {        setMaps(data.records || []);

    navigate(`/view-map/${id}`);        setLoading(false);

  };      })

      .catch(error => {

  const handleEdit = (id: number) => {        console.error('Error fetching maps:', error);

    navigate(`/edit-map/${id}`);        setLoading(false);

  };      });

  }, [user?.customer_id]);

  return (

    <div className="dashboard-page" style={{   const handleView = (id: number) => {

      padding: '24px',     navigate(`/view-map/${id}`);

      maxWidth: '1200px',   };

      margin: '0 auto', 

      color: '#000',  const handleEdit = (id: number) => {

      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',    navigate(`/edit-map/${id}`);

      paddingTop: '80px',  };

      paddingBottom: '40px'

    }}>  return (

      {showNewMapForm ? (    <div className="dashboard-page" style={{ 

        <NewMapForm onCancel={() => setShowNewMapForm(false)} />      padding: '24px', 

      ) : (      maxWidth: '1200px', 

        <>      margin: '0 auto', 

          <div style={{      color: '#000',

            display: 'flex',      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',

            flexDirection: 'row',      paddingTop: '80px',

            justifyContent: 'space-between',      paddingBottom: '40px'

            alignItems: 'center',    }}>

            flexWrap: 'wrap',      {showNewMapForm ? (

            gap: '20px',        <NewMapForm onCancel={() => setShowNewMapForm(false)} />

            marginBottom: '30px'      ) : (

          }}>        <>

            <h1 style={{           <div style={{

              fontSize: 'clamp(24px, 5vw, 32px)',             display: 'flex',

              color: '#000',             flexDirection: 'row',

              fontWeight: '700',             justifyContent: 'space-between',

              margin: '0',            alignItems: 'center',

              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'            flexWrap: 'wrap',

            }}>            gap: '20px',

              My Maps Dashboard            marginBottom: '30px'

            </h1>          }}>

                        <h1 style={{ 

            <button               fontSize: 'clamp(24px, 5vw, 32px)', 

              onClick={() => setShowNewMapForm(true)}               color: '#000', 

              className="create-map-btn"               fontWeight: '700', 

              style={{              margin: '0',

                padding: '14px 24px',              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

                background: '#4f8cff',            }}>

                color: 'white',              My Maps Dashboard

                border: 'none',            </h1>

                borderRadius: '10px',            

                cursor: 'pointer',            <button 

                fontSize: '15px',              onClick={() => setShowNewMapForm(true)} 

                fontWeight: '600',              className="create-map-btn" 

                boxShadow: '0 4px 12px rgba(79,140,255,0.2)',              style={{

                transition: 'all 0.2s ease',                padding: '14px 24px',

                display: 'flex',                background: '#4f8cff',

                alignItems: 'center',                color: 'white',

                gap: '8px',                border: 'none',

                whiteSpace: 'nowrap'                borderRadius: '10px',

              }}                cursor: 'pointer',

              onMouseOver={(e) => {                fontSize: '15px',

                e.currentTarget.style.background = '#3a7dff';                fontWeight: '600',

                e.currentTarget.style.boxShadow = '0 6px 16px rgba(79,140,255,0.3)';                boxShadow: '0 4px 12px rgba(79,140,255,0.2)',

              }}                transition: 'all 0.2s ease',

              onMouseOut={(e) => {                display: 'flex',

                e.currentTarget.style.background = '#4f8cff';                alignItems: 'center',

                e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,140,255,0.2)';                gap: '8px',

              }}                whiteSpace: 'nowrap'

            >              }}

              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">              onMouseOver={e => {

                <line x1="12" y1="5" x2="12" y2="19"></line>                e.currentTarget.style.background = '#3a7dff';

                <line x1="5" y1="12" x2="19" y2="12"></line>                e.currentTarget.style.boxShadow = '0 6px 16px rgba(79,140,255,0.3)';

              </svg>              }}

              Create New Map              onMouseOut={e => {

            </button>                e.currentTarget.style.background = '#4f8cff';

          </div>                e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,140,255,0.2)';

                        }}

          {loading ? (          >

            <div style={{            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

              display: 'flex',              <line x1="12" y1="5" x2="12" y2="19"></line>

              justifyContent: 'center',              <line x1="5" y1="12" x2="19" y2="12"></line>

              alignItems: 'center',            </svg>

              padding: '40px',            Create New Map

              color: '#000'          </button>

            }}>          {loading ? (

              <div style={{ display: 'inline-block', position: 'relative', width: '80px', height: '80px' }}>            <div style={{

                <div style={{              display: 'flex',

                  position: 'absolute',              justifyContent: 'center',

                  border: '4px solid #4f8cff',              alignItems: 'center',

                  opacity: '0.1',              padding: '40px',

                  borderRadius: '50%',              color: '#000'

                  animation: 'ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite',            }}>

                  width: '100%',              <div style={{ display: 'inline-block', position: 'relative', width: '80px', height: '80px' }}>

                  height: '100%'                <div style={{

                }}></div>                  position: 'absolute',

                <div style={{                  border: '4px solid #4f8cff',

                  position: 'absolute',                  opacity: '0.1',

                  border: '4px solid #4f8cff',                  borderRadius: '50%',

                  opacity: '1',                  animation: 'ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite',

                  borderRadius: '50%',                  width: '100%',

                  animation: 'ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite',                  height: '100%'

                  width: '100%',                }}></div>

                  height: '100%',                <div style={{

                  animationDelay: '-0.5s'                  position: 'absolute',

                }}></div>                  border: '4px solid #4f8cff',

              </div>                  opacity: '1',

              <style>{`                  borderRadius: '50%',

                @keyframes ripple {                  animation: 'ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite',

                  0% {                  width: '100%',

                    transform: scale(0);                  height: '100%',

                    opacity: 1;                  animationDelay: '-0.5s'

                  }                }}></div>

                  100% {              </div>

                    transform: scale(1);              <style>{`

                    opacity: 0;                @keyframes ripple {

                  }                  0% {

                }                    transform: scale(0);

              `}</style>                    opacity: 1;

            </div>                  }

          ) : maps.length > 0 ? (                  100% {

            <div className="responsive-table-container" style={{                     transform: scale(1);

              borderRadius: '12px',                    opacity: 0;

              overflow: 'auto',                  }

              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',                }

              border: '1px solid #eaedf3',              `}</style>

              color: '#000',            </div>

              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'          ) : maps.length > 0 ? (

            }}>            <div className="responsive-table-container" style={{ 

              <table style={{               borderRadius: '12px',

                width: '100%',               overflow: 'auto', /* Changed from hidden to auto for scrolling */

                borderCollapse: 'collapse',              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',

                textAlign: 'left',              border: '1px solid #eaedf3',

                fontSize: '14px',              color: '#000',

                minWidth: '800px'              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

              }}>            }}>

                <thead>              <table style={{ 

                  <tr style={{ background: '#f5f8fb' }}>                width: '100%', 

                    <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Title</th>                borderCollapse: 'collapse',

                    <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Description</th>                textAlign: 'left',

                    <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Country</th>                fontSize: '14px',

                    <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Created At</th>                minWidth: '800px' /* Minimum width to ensure table doesn't compress too much */

                    <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Actions</th>              }}>

                  </tr>                <thead>

                </thead>                  <tr style={{ background: '#f5f8fb' }}>

                <tbody>                    <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Title</th>

                  {maps.map((map, index) => (                    <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Description</th>

                    <tr                     <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Country</th>

                      key={map.map_id}                     <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Created At</th>

                      style={{                     <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Actions</th>

                        background: index % 2 === 0 ? 'white' : '#fafbfd',                  </tr>

                        transition: 'all 0.2s ease'                </thead>

                      }}                <tbody>

                      onMouseOver={(e) => e.currentTarget.style.background = '#f0f4f9'}                  {maps.map((map, index) => (

                      onMouseOut={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafbfd'}                    <tr key={map.map_id} style={{ 

                    >                      background: index % 2 === 0 ? 'white' : '#fafbfd',

                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>{map.title}</td>                      transition: 'all 0.2s ease'

                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>                    }}

                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>                    onMouseOver={e => e.currentTarget.style.background = '#f0f4f9'}

                          {map.description || '-'}                    onMouseOut={e => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafbfd'}

                        </div>                    >

                      </td>                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>{map.title}</td>

                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>{map.country || '-'}</td>                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>

                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>{map.created_at?.slice(0, 10) || '-'}</td>                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>

                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>                          {map.description || '-'}

                        <div style={{ display: 'flex', gap: '8px' }}>                        </div>

                          <button                       </td>

                            onClick={() => handleView(map.map_id)}                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>{map.country || '-'}</td>

                            style={{                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>{map.created_at?.slice(0, 10) || '-'}</td>

                              padding: '8px 16px',                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>

                              background: '#f0f4f9',                        <div style={{ display: 'flex', gap: '8px' }}>

                              color: '#4f8cff',                          <button 

                              border: 'none',                            onClick={() => handleView(map.map_id)}

                              borderRadius: '6px',                            style={{

                              cursor: 'pointer',                              padding: '8px 16px',

                              fontWeight: '600',                              background: '#f0f4f9',

                              fontSize: '13px',                              color: '#4f8cff',

                              transition: 'all 0.2s ease'                              border: 'none',

                            }}                              borderRadius: '6px',

                            onMouseOver={(e) => e.currentTarget.style.background = '#e5edfa'}                              cursor: 'pointer',

                            onMouseOut={(e) => e.currentTarget.style.background = '#f0f4f9'}                              fontWeight: '600',

                          >                              fontSize: '13px',

                            View                              transition: 'all 0.2s ease'

                          </button>                            }}

                          <button                             onMouseOver={e => e.currentTarget.style.background = '#e5edfa'}

                            onClick={() => handleEdit(map.map_id)}                            onMouseOut={e => e.currentTarget.style.background = '#f0f4f9'}

                            style={{                          >View</button>

                              padding: '8px 16px',                          <button 

                              background: '#4f8cff',                            onClick={() => handleEdit(map.map_id)}

                              color: 'white',                            style={{

                              border: 'none',                              padding: '8px 16px',

                              borderRadius: '6px',                              background: '#4f8cff',

                              cursor: 'pointer',                              color: 'white',

                              fontWeight: '600',                              border: 'none',

                              fontSize: '13px',                              borderRadius: '6px',

                              transition: 'all 0.2s ease'                              cursor: 'pointer',

                            }}                              fontWeight: '600',

                            onMouseOver={(e) => e.currentTarget.style.background = '#3a7dff'}                              fontSize: '13px',

                            onMouseOut={(e) => e.currentTarget.style.background = '#4f8cff'}                              transition: 'all 0.2s ease'

                          >                            }}

                            Edit                            onMouseOver={e => e.currentTarget.style.background = '#3a7dff'}

                          </button>                            onMouseOut={e => e.currentTarget.style.background = '#4f8cff'}

                        </div>                          >Edit</button>

                      </td>                        </div>

                    </tr>                      </td>

                  ))}                    </tr>

                </tbody>                  ))}

              </table>                </tbody>

            </div>              </table>

          ) : (            </div>

            <div style={{           ) : (

              padding: '40px',             <div style={{ 

              textAlign: 'center',               padding: '40px', 

              color: '#4a5568',              textAlign: 'center', 

              background: '#f9fafc',              color: '#4a5568',

              borderRadius: '12px',              background: '#f9fafc',

              border: '1px dashed #d1d8e4',              borderRadius: '12px',

              margin: '20px 0'              border: '1px dashed #d1d8e4',

            }}>              margin: '20px 0'

              <p style={{ fontSize: '16px', marginBottom: '16px' }}>You don't have any maps yet</p>            }}>

              <p style={{ fontSize: '14px', color: '#718096' }}>Click the 'Create New Map' button to get started</p>              <p style={{ fontSize: '16px', marginBottom: '16px' }}>You don't have any maps yet</p>

            </div>              <p style={{ fontSize: '14px', color: '#718096' }}>Click the 'Create New Map' button to get started</p>

          )}            </div>

        </>          )}

      )}        </>

    </div>      )}

  );    </div>

};  );

};

export default DashboardPage;
export default DashboardPage;
