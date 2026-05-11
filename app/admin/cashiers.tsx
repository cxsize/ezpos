import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '~/components/Icon';
import { useT } from '~/i18n/useT';
import { useSession } from '~/state/session';
import {
  deactivateCashier,
  isOwner,
  listCashiers,
  updateCashierPin,
} from '~/lib/cashiers';
import type { Cashier } from '~/types';

export default function AdminCashiers() {
  const router = useRouter();
  const { t } = useT();
  const cashier = useSession((s) => s.cashier);
  const owner = isOwner(cashier);

  const [list, setList] = useState<Cashier[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pinTarget, setPinTarget] = useState<Cashier | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const items = await listCashiers();
      setList(items);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    if (!owner) {
      router.replace(cashier ? '/sale' : '/signin');
      return;
    }
    refresh();
  }, [owner, cashier, router, refresh]);

  const onDeactivate = async (c: Cashier) => {
    if (c.id === cashier?.id) {
      setError(t.adminCannotDeactivateSelf);
      return;
    }
    if (c.role === 'owner') {
      const otherOwners = (list ?? []).filter((x) => x.role === 'owner' && x.id !== c.id);
      if (otherOwners.length === 0) {
        setError(t.adminCannotDeactivateLastOwner);
        return;
      }
    }
    setError(null);
    try {
      await deactivateCashier(c.id);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (!owner) return null;

  return (
    <View className="flex-1 bg-bg">
      <View className="h-14 px-5 flex-row items-center gap-3 bg-panel border-b border-line">
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-[6px] py-2 px-2">
          <Icon name="back" size={20} color="#68615c" />
          <Text className="text-ink-2 text-[14px] font-medium">{t.back}</Text>
        </Pressable>
        <View className="flex-1">
          <Text style={{ fontFamily: 'BodoniModa' }} className="text-[20px] text-ink">
            {t.adminCashiersTitle}
          </Text>
          <Text className="text-ink-3 text-[11px] uppercase tracking-[0.08em]">
            {t.adminCashiersSub}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/enroll')}
          className="bg-ink rounded-[12px] px-4 py-[10px] flex-row items-center gap-2"
        >
          <Icon name="plus" size={14} color="#fff" />
          <Text className="text-panel text-[12px] uppercase tracking-[0.08em]">
            {t.adminAddNew}
          </Text>
        </Pressable>
      </View>

      {error && (
        <View className="bg-danger/10 px-6 py-3 border-b border-danger/20">
          <Text className="text-danger text-[13px]">{error}</Text>
        </View>
      )}
      {notice && (
        <View className="bg-forest/10 px-6 py-3 border-b border-forest/20">
          <Text className="text-forest text-[13px]">{notice}</Text>
        </View>
      )}

      {list === null ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, gap: 10 }}
        >
          {list.map((c) => (
            <View
              key={c.id}
              className="bg-panel rounded-[16px] border border-line p-4 flex-row items-center gap-4"
            >
              <View className="w-11 h-11 rounded-full bg-bg-soft items-center justify-center">
                <Text className="text-ink text-[14px] font-medium">
                  {c.name[0]?.toUpperCase() ?? '·'}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-ink text-[14px] font-medium">{c.name}</Text>
                  {c.role === 'owner' && (
                    <View className="bg-burgundy/10 px-2 py-[2px] rounded">
                      <Text className="text-burgundy text-[10px] uppercase tracking-[0.08em]">
                        {t.ownerBadge}
                      </Text>
                    </View>
                  )}
                  {c.id === cashier?.id && (
                    <Text className="text-ink-3 text-[11px] uppercase tracking-[0.08em]">
                      · {t.signedInAs.toLowerCase()}
                    </Text>
                  )}
                </View>
                <Text className="text-ink-3 text-[11.5px] mt-[2px]">{c.id}</Text>
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => {
                    setNotice(null);
                    setPinTarget(c);
                  }}
                  className="px-3 py-2 rounded-[10px] bg-bg-soft"
                >
                  <Text className="text-ink-2 text-[12px]">{t.adminResetPin}</Text>
                </Pressable>
                {c.id !== cashier?.id && (
                  <Pressable
                    onPress={() => onDeactivate(c)}
                    className="px-3 py-2 rounded-[10px] bg-danger/10"
                  >
                    <Text className="text-danger text-[12px]">{t.adminDeactivate}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <ResetPinModal
        target={pinTarget}
        onClose={() => setPinTarget(null)}
        onDone={() => {
          setPinTarget(null);
          setNotice(t.adminPinUpdated);
          setTimeout(() => setNotice(null), 2500);
        }}
      />
    </View>
  );
}

function ResetPinModal({
  target,
  onClose,
  onDone,
}: {
  target: Cashier | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useT();
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPin('');
    setError(null);
  }, [target?.id]);

  const submit = async () => {
    if (!target) return;
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be 4 digits');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await updateCashierPin(target.id, pin);
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={!!target} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 bg-black/40 items-center justify-center px-6">
        <Pressable onPress={() => {}} className="w-[400px] bg-panel rounded-[20px] border border-line p-6 gap-4">
          <View>
            <Text style={{ fontFamily: 'BodoniModa' }} className="text-[22px] text-ink">
              {t.adminResetPin}
            </Text>
            {target && (
              <Text className="text-ink-3 text-[13px] mt-1">{target.name}</Text>
            )}
          </View>
          <View className="gap-2">
            <Text className="text-ink-3 text-[11px] uppercase tracking-[0.12em]">
              {t.adminNewPin}
            </Text>
            <TextInput
              value={pin}
              onChangeText={(v) => setPin(v.replace(/\D/g, '').slice(0, 4))}
              className="bg-bg-soft rounded-[10px] px-4 h-12 text-[22px] text-ink tracking-[0.3em]"
              placeholder="• • • •"
              placeholderTextColor="#a39c96"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />
          </View>
          {error && <Text className="text-danger text-[12px]">{error}</Text>}
          <View className="flex-row gap-3">
            <Pressable
              onPress={onClose}
              className="flex-1 h-[48px] rounded-[12px] items-center justify-center bg-bg-soft"
            >
              <Text className="text-ink-2 text-[14px]">{t.back}</Text>
            </Pressable>
            <Pressable
              onPress={submit}
              disabled={busy || pin.length !== 4}
              className={`flex-1 h-[48px] rounded-[12px] items-center justify-center ${
                busy || pin.length !== 4 ? 'bg-line' : 'bg-ink'
              }`}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-panel text-[14px] font-semibold uppercase tracking-[0.08em]">
                  {t.apply}
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
