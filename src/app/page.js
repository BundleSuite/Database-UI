'use client'
import styles from "./page.module.css";
import { useState, useEffect, useMemo } from 'react';

// Simple Modal component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
        {children}
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="pagination-buttons">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
      &laquo; Previous
      </button>
      <span>{currentPage} of {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next &raquo;
      </button>
    </div>
  );
};

// New LoginScreen component
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'BundleSuite' && password === 'BundleSuite@12345') {
      onLogin();
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="container">
      <div className="loginBox">
        <h2 className="title ">Sign In</h2>
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="button" type="submit">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  const [shopifyStores, setShopifyStores] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [storesPage, setStoresPage] = useState(1);
  const [bundlesPage, setBundlesPage] = useState(1);
  const [storesSortField, setStoresSortField] = useState('installedAt');
  const [storesSortDirection, setStoresSortDirection] = useState('desc');
  const itemsPerPage = 10;
  const [bundleSearch, setBundleSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const bundlesPerPage = 10; // Adjust as needed
  const [paginatedBundles, setPaginatedBundles] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setShopifyStores(data.shopifyStores);
        setBundles(data.bundles);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const openProductsModal = (products) => {
    setSelectedProducts(products);
    setModalOpen(true);
  };

  // Calculate bundle count for each store
  const bundleCountByStore = useMemo(() => {
    return bundles.reduce((acc, bundle) => {
      const storeUrl = bundle.storeUrl;
      acc[storeUrl] = (acc[storeUrl] || 0) + 1;
      return acc;
    }, {});
  }, [bundles]);

  const sortedShopifyStores = useMemo(() => {
    return [...shopifyStores].sort((a, b) => {
      let aValue, bValue;

      switch (storesSortField) {
        case 'installedAt':
          aValue = new Date(a.shopInstallation.installedAt);
          bValue = new Date(b.shopInstallation.installedAt);
          break;
        case 'bundleCount':
          aValue = bundleCountByStore[a.url] || 0;
          bValue = bundleCountByStore[b.url] || 0;
          break;
        case 'age':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return storesSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return storesSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [shopifyStores, storesSortField, storesSortDirection, bundleCountByStore]);

  const paginateData = (data, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const paginatedStores = paginateData(sortedShopifyStores, storesPage);

  const handleSort = (field) => {
    if (field === storesSortField) {
      setStoresSortDirection(storesSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setStoresSortField(field);
      setStoresSortDirection('asc');
    }
    setStoresPage(1);
  };

  const handleBundleSearch = (e) => {
    setBundleSearch(e.target.value.toLowerCase());
    setBundlesPage(1); // Reset to first page when search changes
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  const changePage = (newPage) => {
    setBundlesPage(newPage);
  };

  useEffect(() => {
    updateBundlesTable();
  }, [bundles, bundleSearch, bundlesPage, sortOrder]);

  const updateBundlesTable = () => {
    // Step 1: Filter bundles based on search term
    let filteredBundles = bundles.filter(bundle =>
      bundle.bundleName.toLowerCase().includes(bundleSearch)
    );

    // Step 2: Sort filtered bundles by createdAt
    filteredBundles.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Step 3: Calculate total pages
    const totalFilteredBundles = filteredBundles.length;
    const calculatedTotalPages = Math.ceil(totalFilteredBundles / bundlesPerPage);
    setTotalPages(calculatedTotalPages);

    // Step 4: Paginate the sorted and filtered bundles
    const startIndex = (bundlesPage - 1) * bundlesPerPage;
    const paginatedResults = filteredBundles.slice(startIndex, startIndex + bundlesPerPage);

    // Update state with the paginated, sorted, and filtered bundles
    setPaginatedBundles(paginatedResults);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Database UI</h1>
        
        <h2>Shopify Stores</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Shop</th>
              <th>URL</th>
              <th>Plan Display Name</th>
              <th>
                Age
                <button className="sort-button" onClick={() => handleSort('age')}>
                  {storesSortField === 'age' ? (storesSortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                </button>
              </th>
              <th>
                Installed
                <button className="sort-button" onClick={() => handleSort('installedAt')}>
                  {storesSortField === 'installedAt' ? (storesSortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                </button>
              </th>
              <th>
                Total Bundles
                <button className="sort-button" onClick={() => handleSort('bundleCount')}>
                  {storesSortField === 'bundleCount' ? (storesSortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedStores.map((store) => (
              <tr key={store.shop}>
                <td>{store.name}</td>
                <td>
                  <a href={`${store.shop}`} target="_blank" rel="noopener noreferrer">
                    {store.shop}
                  </a>
                </td>
                <td>
                  <a href={store.url} target="_blank" rel="noopener noreferrer">
                    {store.url}
                  </a>
                </td>
                <td>{store.planDisplayName}</td>
                <td>{store.age}</td>
                <td>{store.installedAgo}</td>
                <td>{bundleCountByStore[store.url] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={storesPage}
          totalPages={Math.ceil(sortedShopifyStores.length / itemsPerPage)}
          onPageChange={setStoresPage}
        />

        <h2>Bundles</h2>
        <div className="bundleSearch">
          <input
            type="text"
            placeholder="Search bundles..."
            value={bundleSearch}
            onChange={handleBundleSearch}
            className={styles.searchInput}
          />
          <button onClick={toggleSortOrder}>
            Sort by Date ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
          </button>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Store URL</th>
                <th>Bundle Name</th>
                <th>Bundle Type</th>
                <th>Handle</th>
                <th>Discount Type</th>
                <th>Discount Value</th>
                <th>Products</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBundles.map((bundle) => (
                <tr key={bundle.id}>
                  <td>{bundle.storeName}</td>
                  <td>
                    <a href={bundle.storeUrl} target="_blank" rel="noopener noreferrer">
                      {bundle.storeUrl}
                    </a>
                  </td>
                  <td>{bundle.bundleName}</td>
                  <td>{bundle.bundleType}</td>
                  <td>{bundle.ProductHandle}</td>
                  <td>{bundle.discountType}</td>
                  <td>{bundle.discountValue}</td>
                  <td>
                    <button onClick={() => openProductsModal(bundle.products)}>
                      View Products
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={bundlesPage}
            totalPages={totalPages}
            onPageChange={changePage}
          />
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <h2>Products</h2>
          <pre>{JSON.stringify(selectedProducts, null, 2)}</pre>
        </Modal>

        <button onClick={() => setIsLoggedIn(false)}>Logout</button>
      </main>
    </div>
  );
}
