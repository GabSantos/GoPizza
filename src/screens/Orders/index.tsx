import React, { useEffect, useState } from 'react';
import { FlatList, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';


import { useAuth } from '../../hooks/auth';
import { ItemSeparator } from '../../components/ItemSeparator';
import { OrderCard, OrderProps } from '../../components/OrderCard';

import {
  Container,
  Header,
  Title
} from './styles';


export function Orders() {
  const [orders, serOrders] = useState<OrderProps[]>([]);
  const { user } = useAuth();

  function handlePizzaDelivered(id: string) {
    Alert.alert('Pedido entregue', 'Obrigado por comprar com a gente!', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        onPress: () => {
          firestore().collection('orders').doc(id).update({
            status: 'Entregue'
          })
        }
      }
    ]);

  }

  useEffect(() => {
    const subscribe = firestore().collection('orders').where('waiter_id', '==', user?.id).onSnapshot(querySnapshot => {
      const data = querySnapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data()
        };
      }) as OrderProps[];
      serOrders(data);
    });

    return () => subscribe();

  }, [])

  return (
    <Container>
      <Header>
        <Title>Pedidos feitos</Title>
      </Header>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <OrderCard
            index={index}
            data={item}
            disabled={item.status === 'Entregue'}
            onPress={() => handlePizzaDelivered(item.id)}
          />
        )}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 125, paddingHorizontal: 24 }}
        ItemSeparatorComponent={() => <ItemSeparator />}
      />

    </Container>
  );
}
