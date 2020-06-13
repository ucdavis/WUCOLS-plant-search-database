
            <h4>Water Use</h4>
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Abbreviation</th>
                  <th>Percentage of ET<sub>0</sub></th>
                </tr>
              </thead>
              <tbody>
                {data.waterUseClassifications.map(pt => (
                  <tr key={pt.code}>
                    <td>{pt.name}</td>
                    <td>{pt.code}</td>
                    <td>{pt.percentageET0}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Your Location</h4>
            <div>{lat + ", " + lng} {error}</div>
            <SimpleMap />
            <hr/>

            <h4>Plant Names</h4>
            <div className="mb-1">Synchronous (slow)</div>
            <Select options={plantNameOptions}/>
            <div className="mb-1">Asynchronous (fast)</div>
            <AsyncSelect formatOptionLabel={formatPlantLabel} cacheOptions placeholder="Search plant names" loadOptions={plantNamePromiseOptions} noOptionsMessage={() => "No plant matches your search"}/>