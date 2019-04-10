import React, { useState, useEffect } from 'react';
import {
  Table,
  Message,
  Button,
  Modal,
} from 'semantic-ui-react';

const ERROR_STATE = {
  status: false,
  message: '',
};
const ITEMS_STATE = [];

const getItems = async (token, url) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': token,
    },
  });
  const { status } = res;
  const success = status === 200 || status === 201;
  const data = success ? await res.json() : await res.text();

  return {
    status,
    success,
    data,
  };
};

const Edit = () => (
  <Modal trigger={<Button size="tiny" icon="pencil" color="yellow" />}>
    <Modal.Header>Save Changes</Modal.Header>
    <Modal.Content>
      <p>Are you sure you want to save the changes?</p>
    </Modal.Content>
    <Modal.Actions>
      <Button negative>No</Button>
      <Button positive icon='checkmark' labelPosition='right' content='Yes' />
    </Modal.Actions>
  </Modal>
);

const Remove = () => (
  <Modal trigger={<Button size="tiny" icon="trash" color="red" />}>
    <Modal.Header>Remove Item</Modal.Header>
    <Modal.Content>
      <p>Are you sure you want to delete this item?</p>
    </Modal.Content>
    <Modal.Actions>
      <Button negative>No</Button>
      <Button positive icon='checkmark' labelPosition='right' content='Yes' />
    </Modal.Actions>
  </Modal>
);

const mapPermissions = (items, permissions, resource) => {
  const defaultPermission = {
    owner: false,
    permissions: {
      read: false,
      write: false,
      delete: false,
    }
  };

  return items.map((item) => {
    const permission = permissions
      .find(acl => Number(item.id) === Number(acl.id) && acl.resource === resource) || defaultPermission;

    return {...item, owner: permission.owner, permissions: permission.permissions};
  });
};

const List = ({ token, url, permissions, resource }) => {
  const [items, setItems] = useState(ITEMS_STATE);
  const [error, setError] = useState(ERROR_STATE);

  useEffect(() => {
      getItems(token, url)
        .then(({ status, success, data }) => {
          if (success) {
            setItems(mapPermissions(data, permissions, resource));
            setError(ERROR_STATE);
          } else {
            setError({
              status: true,
              message: `${status}: ${data}`,
            });
          }
        })
      ;

      return () => {
        setError(ERROR_STATE);
        setItems(ITEMS_STATE);
      }
  }, [token]);

  return (
    <div>
      {error.status
      ? (
        <Message negative>
          <Message.Header>Oops, something went wrong.</Message.Header>
          <p>{error.message}</p>
        </Message>
      ) : (
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>ID</Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {items.map(item => (
                <Table.Row key={item.id}>
                  <Table.Cell>{item.id}</Table.Cell>
                  <Table.Cell>{item.name}</Table.Cell>
                  <Table.Cell>
                    {(item.owner || item.permissions.write) && <Edit />}
                    {(item.owner || item.permissions.delete) && <Remove />}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
      )}
    </div>
  );
}

export default List;
